import requests


def search_books(query: str) -> list[dict]:
    try:
        res = requests.get(
            'https://openlibrary.org/search.json',
            params={
                'q': query,
                'limit': 12,
                'fields': 'key,title,cover_i,first_publish_year,author_name,subject,isbn',
            },
            timeout=15,
        )
        if not res.ok:
            return []
        results = []
        for item in (res.json().get('docs') or [])[:12]:
            key = (item.get('key') or '').replace('/works/', '')
            author = (item.get('author_name') or [None])[0]
            isbn_list = item.get('isbn') or []
            results.append({
                'externalId': f"openlibrary-{key}",
                'title': item.get('title') or 'Sin título',
                'type': 'Book',
                'coverUrl': f"https://covers.openlibrary.org/b/id/{item['cover_i']}-L.jpg" if item.get('cover_i') else None,
                'year': item.get('first_publish_year') or None,
                'description': f"de {author}" if author else None,
                'genres': (item.get('subject') or [])[:3],
                'author': author,
                'isbn': isbn_list[0] if isbn_list else None,
            })
        return results
    except Exception:
        return []