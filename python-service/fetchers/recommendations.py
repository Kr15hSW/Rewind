import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

TMDB_KEY    = os.getenv('TMDB_API_KEY')
RAWG_KEY    = os.getenv('RAWG_API_KEY')
TMDB_IMG    = 'https://image.tmdb.org/t/p/w500'
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5223')


def _get_collection(token: str) -> list[dict]:
    try:
        res = requests.get(
            f'{BACKEND_URL}/api/collection',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10,
        )
        print(f'[rec] Colección: HTTP {res.status_code}')
        if not res.ok:
            return []
        data = res.json()
        print(f'[rec] Colección: {len(data)} entradas')
        return data
    except Exception as e:
        print(f'[rec] Error al obtener colección: {e}')
        return []


def _best_rated(collection: list[dict]) -> list[dict]:
    scored = [e for e in collection if e.get('score') is not None]
    top = [e for e in scored if e['score'] >= 8]
    if len(top) < 3:
        top = [e for e in scored if e['score'] >= 6]
    print(f'[rec] Ítems bien valorados: {len(top)} (de {len(scored)} puntuados)')
    for e in top:
        mi = e.get('mediaItem', {})
        print(f'  [{mi.get("type")}] {mi.get("title")} — score={e.get("score")} — externalId={mi.get("externalId")} — author={mi.get("author")}')
    return top


def _existing_ids(collection: list[dict]) -> set[str]:
    ids = {
        e['mediaItem']['externalId']
        for e in collection
        if e.get('mediaItem') and e['mediaItem'].get('externalId')
    }
    print(f'[rec] IDs ya en colección: {ids}')
    return ids


def _recommend_movies(top: list[dict], seen: set[str]) -> list[dict]:
    results = []
    local_seen = set(seen)
    movie_items = [e for e in top if e['mediaItem']['type'] == 'movie'][:3]
    print(f'[rec:movies] Películas de referencia: {len(movie_items)}')

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
                print(f'[rec:movies] TMDB movie {tmdb_id}: error {res.status_code}')
                continue
            items = (res.json().get('results') or [])[:6]
            print(f'[rec:movies] TMDB movie {tmdb_id}: {len(items)} candidatos')
            for item in items:
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
        except Exception as e:
            print(f'[rec:movies] Excepción {tmdb_id}: {e}')
            continue

    print(f'[rec:movies] Total: {len(results)}')
    return results


def _recommend_series(top: list[dict], seen: set[str]) -> list[dict]:
    results = []
    local_seen = set(seen)
    series_items = [e for e in top if e['mediaItem']['type'] == 'series'][:3]
    print(f'[rec:series] Series de referencia: {len(series_items)}')

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
                print(f'[rec:series] TMDB series {tmdb_id}: error {res.status_code}')
                continue
            items = (res.json().get('results') or [])[:6]
            print(f'[rec:series] TMDB series {tmdb_id}: {len(items)} candidatos')
            for item in items:
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
        except Exception as e:
            print(f'[rec:series] Excepción {tmdb_id}: {e}')
            continue

    print(f'[rec:series] Total: {len(results)}')
    return results


def _recommend_games(top: list[dict], seen: set[str]) -> list[dict]:
    game_items = [e for e in top if e['mediaItem']['type'] == 'game']
    print(f'[rec:games] Juegos de referencia: {len(game_items)}')
    if not game_items:
        return []

    top_game = game_items[0]
    ext_id = top_game['mediaItem'].get('externalId', '')
    if not ext_id.startswith('rawg-'):
        print(f'[rec:games] externalId no reconocido: {ext_id}')
        return []

    rawg_id = ext_id.replace('rawg-', '')
    print(f'[rec:games] Obteniendo géneros del juego rawg id={rawg_id}')

    try:
        detail_res = requests.get(
            f'https://api.rawg.io/api/games/{rawg_id}',
            params={'key': RAWG_KEY},
            timeout=10,
        )
        if not detail_res.ok:
            print(f'[rec:games] Error al obtener detalle: {detail_res.status_code}')
            return []

        genre_slugs = [g['slug'] for g in (detail_res.json().get('genres') or [])]
        print(f'[rec:games] Slugs de género: {genre_slugs}')
        if not genre_slugs:
            return []

        res = requests.get(
            'https://api.rawg.io/api/games',
            params={
                'key': RAWG_KEY,
                'genres': ','.join(genre_slugs[:2]),
                'ordering': '-rating',
                'page_size': 20,
                'exclude_additions': True,
            },
            timeout=10,
        )
        if not res.ok:
            print(f'[rec:games] Error en búsqueda por género: {res.status_code}')
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

        print(f'[rec:games] Total: {len(results[:12])}')
        return results[:12]

    except Exception as e:
        print(f'[rec:games] Excepción: {e}')
        return []


def _recommend_books(top: list[dict], seen: set[str]) -> list[dict]:
    book_items = [e for e in top if e['mediaItem']['type'] == 'book']
    print(f'[rec:books] Libros de referencia: {len(book_items)}')
    if not book_items:
        return []

    author = None
    for entry in book_items:
        a = entry['mediaItem'].get('author')
        if a:
            author = a
            break

    print(f'[rec:books] Autor de referencia: {author!r}')
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
            print(f'[rec:books] Error en búsqueda: {res.status_code}')
            return []

        docs = res.json().get('docs') or []
        print(f'[rec:books] Candidatos de Open Library: {len(docs)}')

        results = []
        local_seen = set(seen)
        for item in docs[:20]:
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

        print(f'[rec:books] Total: {len(results[:12])}')
        return results[:12]

    except Exception as e:
        print(f'[rec:books] Excepción: {e}')
        return []


def get_recommendations(token: str) -> dict:
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
            except Exception as e:
                print(f'[rec] Excepción en hilo {t}: {e}')
                ordered[t] = []

    combined = [item for t in type_order for item in ordered[t]]
    print(f'[rec] Total final: {len(combined)} recomendaciones')
    return {'results': combined, 'reason': 'ok'}