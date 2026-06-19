import os
import requests

RAWG_KEY = os.getenv('RAWG_API_KEY')


def search_games(query: str) -> list[dict]:
    try:
        res = requests.get(
            'https://api.rawg.io/api/games',
            params={'key': RAWG_KEY, 'search': query, 'page_size': 12},
            timeout=10,
        )
        if not res.ok:
            return []
        results = []
        for item in (res.json().get('results') or []):
            platforms = [
                p['platform']['name']
                for p in (item.get('platforms') or [])
                if p.get('platform') and p['platform'].get('name')
            ]
            results.append({
                'externalId': f"rawg-{item['id']}",
                'title': item.get('name') or 'Sin título',
                'type': 'Game',
                'coverUrl': item.get('background_image') or None,
                'year': int(item['released'].split('-')[0]) if item.get('released') else None,
                'description': None,
                'genres': [g['name'] for g in (item.get('genres') or [])],
                'platforms': platforms,
            })
        return results
    except Exception:
        return []