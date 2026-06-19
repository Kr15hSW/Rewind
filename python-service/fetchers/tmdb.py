import os
import requests

TMDB_KEY = os.getenv('TMDB_API_KEY')
TMDB_IMG = 'https://image.tmdb.org/t/p/w500'


def search_movies(query: str) -> list[dict]:
    try:
        res = requests.get(
            'https://api.themoviedb.org/3/search/movie',
            params={'api_key': TMDB_KEY, 'query': query, 'language': 'es-ES'},
            timeout=10,
        )
        if not res.ok:
            return []
        results = []
        for item in (res.json().get('results') or [])[:12]:
            results.append({
                'externalId': f"tmdb-movie-{item['id']}",
                'title': item.get('title') or item.get('original_title') or 'Sin título',
                'type': 'Movie',
                'coverUrl': f"{TMDB_IMG}{item['poster_path']}" if item.get('poster_path') else None,
                'year': int(item['release_date'].split('-')[0]) if item.get('release_date') else None,
                'description': item.get('overview') or None,
                'genres': [],
            })
        return results
    except Exception:
        return []


def search_series(query: str) -> list[dict]:
    try:
        res = requests.get(
            'https://api.themoviedb.org/3/search/tv',
            params={'api_key': TMDB_KEY, 'query': query, 'language': 'es-ES'},
            timeout=10,
        )
        if not res.ok:
            return []
        results = []
        for item in (res.json().get('results') or [])[:12]:
            results.append({
                'externalId': f"tmdb-series-{item['id']}",
                'title': item.get('name') or item.get('original_name') or 'Sin título',
                'type': 'Series',
                'coverUrl': f"{TMDB_IMG}{item['poster_path']}" if item.get('poster_path') else None,
                'year': int(item['first_air_date'].split('-')[0]) if item.get('first_air_date') else None,
                'description': item.get('overview') or None,
                'genres': [],
            })
        return results
    except Exception:
        return []