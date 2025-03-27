import streamlit as st
import requests
from datetime import datetime
from calendar import monthrange

# Sidebar: TMDb API Key input
st.sidebar.title("🔐 Configuration")
api_key = st.sidebar.text_input("TMDb API Key", type="password")

def get_top_movies(year: int, month: int, api_key: str):
    start_date = f"{year}-{month:02d}-01"
    end_day = monthrange(year, month)[1]
    end_date = f"{year}-{month:02d}-{end_day}"
    
    url = "https://api.themoviedb.org/3/discover/movie"
    params = {
        "api_key": api_key,
        "primary_release_date.gte": start_date,
        "primary_release_date.lte": end_date,
        "sort_by": "popularity.desc",
        "page": 1
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return []
    data = response.json()
    return data.get("results", [])[:5]

# Main interface
st.title("🎬 Top 5 Movies by Month")
st.write("Select a year and month to see the most popular movies released during that time.")

col1, col2 = st.columns(2)
with col1:
    year = st.number_input("Year", min_value=1950, max_value=datetime.now().year, value=2023)
with col2:
    month = st.selectbox("Month", list(range(1, 13)), format_func=lambda m: datetime(1900, m, 1).strftime('%B'))

if st.button("Get Movies"):
    if not api_key:
        st.error("Please enter a TMDb API key in the sidebar.")
    else:
        with st.spinner("Fetching movies..."):
            movies = get_top_movies(year, month, api_key)
            if movies:
                for movie in movies:
                    st.markdown("---")
                    st.subheader(movie.get("title", "No Title"))
                    cols = st.columns([1, 3])
                    poster_path = movie.get("poster_path")
                    if poster_path:
                        poster_url = f"https://image.tmdb.org/t/p/w200{poster_path}"
                        cols[0].image(poster_url)
                    else:
                        cols[0].text("No image")
                    overview = movie.get("overview", "No overview available.")
                    release_date = movie.get("release_date", "Unknown")
                    rating = movie.get("vote_average", "N/A")
                    cols[1].markdown(f"**Release Date:** {release_date}")
                    cols[1].markdown(f"**Rating:** ⭐ {rating}")
                    cols[1].markdown(f"**Overview:** {overview}")
            else:
                st.warning("No movies found or invalid API key.")