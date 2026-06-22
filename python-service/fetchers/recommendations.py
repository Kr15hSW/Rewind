import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

TMDB_KEY = os.getenv('TMDB_API_KEY')
RAWG_KEY = os.getenv('RAWG_API_KEY')
TMDB_IMG = 'https://image.tmdb.org/t/p/w500'
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5223')


def _get_collection(token: str) -> list[dict]:
    """Obtiene la colección del usuario desde el backend C#, reenviando el JWT."""
    try:
        res = requests.get(
            f'{BACKEND_URL}/api/collection',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10,
        )
        if not res.ok:
            return []
        return res.json()
    except Exception:
        return []


def _best_rated(collection: list[dict]) -> list[dict]:
    """Ítems con puntuación >= 8. Si hay menos de 3, baja el umbral a >= 6."""
    scored = [e for e in collection if e.get('score') is not None]
    top = [e for e in scored if e['score'] >= 8]
    if len(top) < 3:
        top = [e for e in scored if e['score'] >= 6]
    return top


def _existing_ids(collection: list[dict]) -> set[str]:
    return {
        e['mediaItem']['externalId']
        for e in collection
        if e.get('mediaItem') and e['mediaItem'].get('externalId')
    }


def _recommend_movies(top: list[dict], seen: set[str]) -> list[dict]:
    results = []
    local_seen = set(seen)
    movie_items = [e for e in top if e['mediaItem']['type'] == 'Movie'][:3]
    for entry in movie_items:
        ext_id = entry['mediaItem'].get('externalId', '')
        if not ext_id.startswith('tmdb-movie-'):
            continue
        tmdb_id = ext_id.replace('tmdb-movie-', '')
        try:
            res = requests.get(
                f'https://api.themoviedb.org/3/movie/{tmdb_id}/recommendations',
                params={'api_key': TMDB_KEY, 'language': 'es-ES'},
                timeout=10,
            )
            if not res.ok:
                continue
            for item in (res.json().get('results') or [])[:6]:
                ext = f"tmdb-movie-{item['id']}"
                if ext in local_seen:
                    continue
                local_seen.add(ext)
                results.append({
                    'externalId': ext,
                    'title': item.get('title') or item.get('original_title') or 'Sin título',
                    'type': 'Movie',
                    'coverUrl': f"{TMDB_IMG}{item['poster_path']}" if item.get('poster_path') else None,
                    'year': int(item['release_date'].split('-')[0]) if item.get('release_date') else None,
                    'description': item.get('overview') or None,
                    'genres': [],
                })
        except Exception:
            continue
    return results


def _recommend_series(top: list[dict], seen: set[str]) -> list[dict]:
    results = []
    local_seen = set(seen)
    series_items = [e for e in top if e['mediaItem']['type'] == 'Series'][:3]
    for entry in series_items:
        ext_id = entry['mediaItem'].get('externalId', '')
        if not ext_id.startswith('tmdb-series-'):
            continue
        tmdb_id = ext_id.replace('tmdb-series-', '')
        try:
            res = requests.get(
                f'https://api.themoviedb.org/3/tv/{tmdb_id}/recommendations',
                params={'api_key': TMDB_KEY, 'language': 'es-ES'},
                timeout=10,
            )
            if not res.ok:
                continue
            for item in (res.json().get('results') or [])[:6]:
                ext = f"tmdb-series-{item['id']}"
                if ext in local_seen:
                    continue
                local_seen.add(ext)
                results.append({
                    'externalId': ext,
                    'title': item.get('name') or item.get('original_name') or 'Sin título',
                    'type': 'Series',
                    'coverUrl': f"{TMDB_IMG}{item['poster_path']}" if item.get('poster_path') else None,
                    'year': int(item['first_air_date'].split('-')[0]) if item.get('first_air_date') else None,
                    'description': item.get('overview') or None,
                    'genres': [],
                })
        except Exception:
            continue
    return results


def _recommend_games(top: list[dict], seen: set[str]) -> list[dict]:
    game_items = [e for e in top if e['mediaItem']['type'] == 'Game']
    if not game_items:
        return []

    seen_genres: set[str] = set()
    genre_slugs: list[str] = []
    for entry in game_items:
        for g in (entry['mediaItem'].get('genres') or []):
            slug = g.lower().replace(' ', '-')
            if slug not in seen_genres:
                seen_genres.add(slug)
                genre_slugs.append(slug)

    if not genre_slugs:
        return []

    try:
        res = requests.get(
            'https://api.rawg.io/api/games',
            params={
                'key': RAWG_KEY,
                'genres': genre_slugs[0],
                'ordering': '-rating',
                'page_size': 20,
            },
            timeout=10,
        )
        if not res.ok:
            return []

        results = []
        local_seen = set(seen)
        for item in (res.json().get('results') or []):
            ext = f"rawg-{item['id']}"
            if ext in local_seen:
                continue
            local_seen.add(ext)
            platforms = [
                p['platform']['name']
                for p in (item.get('platforms') or [])
                if p.get('platform') and p['platform'].get('name')
            ]
            results.append({
                'externalId': ext,
                'title': item.get('name') or 'Sin título',
                'type': 'Game',
                'coverUrl': item.get('background_image') or None,
                'year': int(item['released'].split('-')[0]) if item.get('released') else None,
                'description': None,
                'genres': [g['name'] for g in (item.get('genres') or [])],
                'platforms': platforms,
            })
        return results[:12]
    except Exception:
        return []


def _recommend_books(top: list[dict], seen: set[str]) -> list[dict]:
    book_items = [e for e in top if e['mediaItem']['type'] == 'Book']
    if not book_items:
        return []

    author = None
    for entry in book_items:
        a = entry['mediaItem'].get('author')
        if a:
            author = a
            break

    if not author:
        return []

    try:
        res = requests.get(
            'https://openlibrary.org/search.json',
            params={
                'author': author,
                'limit': 20,
                'fields': 'key,title,cover_i,first_publish_year,author_name,subject,isbn',
            },
            timeout=15,
        )
        if not res.ok:
            return []

        results = []
        local_seen = set(seen)
        for item in (res.json().get('docs') or [])[:20]:
            key = (item.get('key') or '').replace('/works/', '')
            ext = f"openlibrary-{key}"
            if ext in local_seen:
                continue
            local_seen.add(ext)
            author_name = (item.get('author_name') or [None])[0]
            isbn_list = item.get('isbn') or []
            results.append({
                'externalId': ext,
                'title': item.get('title') or 'Sin título',
                'type': 'Book',
                'coverUrl': f"https://covers.openlibrary.org/b/id/{item['cover_i']}-L.jpg" if item.get('cover_i') else None,
                'year': item.get('first_publish_year') or None,
                'description': f"de {author_name}" if author_name else None,
                'genres': (item.get('subject') or [])[:3],
                'author': author_name,
                'isbn': isbn_list[0] if isbn_list else None,
            })
        return results[:12]
    except Exception:
        return []


def get_recommendations(token: str) -> dict:
    """
    Punto de entrada principal.
    Devuelve {'results': [...], 'reason': 'ok' | 'empty_collection' | 'no_scores'}
    """
    collection = _get_collection(token)

    if not collection:
        return {'results': [], 'reason': 'empty_collection'}

    scored = [e for e in collection if e.get('score') is not None]
    if not scored:
        return {'results': [], 'reason': 'no_scores'}

    existing = _existing_ids(collection)
    top = _best_rated(collection)

    type_order = ['movie', 'series', 'game', 'book']
    recommenders = {
        'movie':  lambda: _recommend_movies(top, existing),
        'series': lambda: _recommend_series(top, existing),
        'game':   lambda: _recommend_games(top, existing),
        'book':   lambda: _recommend_books(top, existing),
    }

    ordered: dict[str, list] = {t: [] for t in type_order}
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_type = {executor.submit(fn): t for t, fn in recommenders.items()}
        for future in as_completed(future_to_type):
            t = future_to_type[future]
            try:
                ordered[t] = future.result()
            except Exception:
                ordered[t] = []

    combined = [item for t in type_order for item in ordered[t]]
    return {'results': combined, 'reason': 'ok'}