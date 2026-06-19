import os
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


@app.route('/api/search', methods=['GET'])
def search():
    media_type = request.args.get('type', '').lower()
    query = request.args.get('query', '').strip()

    if not query:
        return jsonify([])

    if media_type == 'movie':
        return jsonify(search_movies(query))

    if media_type == 'series':
        return jsonify(search_series(query))

    if media_type == 'game':
        return jsonify(search_games(query))

    if media_type == 'book':
        return jsonify(search_books(query))

    if media_type == 'all':
        fetchers = [search_movies, search_series, search_games, search_books]
        ordered = [[] for _ in fetchers]
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_idx = {executor.submit(f, query): i for i, f in enumerate(fetchers)}
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