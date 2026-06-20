import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from fetchers.open_library import search_books
from fetchers.rawg import search_games
from fetchers.tmdb import search_movies, search_series

load_dotenv()

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])

# Cache in memory
# Key: "type:search_word" (case insensitive)
# Value: (timestamp of save, results)
CACHE_TTL_SECONDS = 600  # 10 minutos
_cache: dict[str, tuple[float, list[dict]]] = {}
_cache_lock = threading.Lock()  # evita problemas si dos peticiones llegan a la vez

FETCHERS = {
    'movie': search_movies,
    'series': search_series,
    'game': search_games,
    'book': search_books,
}


def get_or_fetch(media_type: str, query: str) -> list[dict]:
    """Devuelve resultados de caché si son recientes, o los busca y los guarda si no."""
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
        # Call all 4 fetchers parallely and each will check their cache internally
        # saving indexed results respecting the order movies->shows->games->book
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


if __name__ == '__main__':
    app.run(port=5000, debug=True)