import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from fetchers.open_library import search_books
from fetchers.rawg import search_games
from fetchers.recommendations import get_recommendations
from fetchers.tmdb import search_movies, search_series

load_dotenv()

app = Flask(__name__)

# CORS - lee orígenes de CORS_ORIGINS
_cors_origins = [
    o.strip()
    for o in os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')
    if o.strip()
]
CORS(app, origins=_cors_origins)

# Caché en memoria
CACHE_TTL_SECONDS              = 600
RECOMMENDATIONS_TTL_SECONDS    = 300
_cache: dict[str, tuple[float, list[dict]]] = {}
_cache_lock = threading.Lock()

FETCHERS = {
    'movie': search_movies,
    'series': search_series,
    'game': search_games,
    'book': search_books,
}


def get_or_fetch(media_type: str, query: str) -> list[dict]:
    key = f"{media_type}:{query.lower()}"
    with _cache_lock:
        cached = _cache.get(key)
        if cached is not None:
            saved_at, results = cached
            if time.time() - saved_at < CACHE_TTL_SECONDS:
                print(f"[cache] HIT  -> {key}")
                return results
    print(f"[cache] MISS -> {key}")
    results = FETCHERS[media_type](query)
    with _cache_lock:
        _cache[key] = (time.time(), results)
    return results


@app.route('/api/search', methods=['GET'])
def search():
    media_type = request.args.get('type', '').lower()
    query = request.args.get('query', '').strip()

    if not query:
        return jsonify([])

    if media_type in FETCHERS:
        return jsonify(get_or_fetch(media_type, query))

    if media_type == 'all':
        types_order = ['movie', 'series', 'game', 'book']
        ordered = [[] for _ in types_order]
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_idx = {
                executor.submit(get_or_fetch, t, query): i
                for i, t in enumerate(types_order)
            }
            for future in as_completed(future_to_idx):
                idx = future_to_idx[future]
                try:
                    ordered[idx] = future.result()
                except Exception:
                    ordered[idx] = []
        combined = [item for sublist in ordered for item in sublist]
        return jsonify(combined)

    return jsonify({'error': f'Tipo desconocido: {media_type}'}), 400


@app.route('/api/recommendations', methods=['GET'])
def recommendations():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token de autorización requerido'}), 401

    token = auth_header.removeprefix('Bearer ')
    cache_key = f"recommendations:{token}"

    with _cache_lock:
        cached = _cache.get(cache_key)
        if cached is not None:
            saved_at, data = cached
            if time.time() - saved_at < RECOMMENDATIONS_TTL_SECONDS:
                print(f"[cache] HIT  -> recommendations (usuario cacheado)")
                return jsonify(data)

    print(f"[cache] MISS -> recommendations (calculando...)")
    data = get_recommendations(token)

    with _cache_lock:
        _cache[cache_key] = (time.time(), data)

    return jsonify(data)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)