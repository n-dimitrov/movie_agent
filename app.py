import streamlit as st
import requests
from datetime import datetime
from calendar import monthrange
import random

api_key = st.secrets["tmdb"]["api_key"]

# Sidebar: TMDb API Key and year range config
st.sidebar.title("🔐 Configuration")

current_year = datetime.now().year
default_min_year = 1978
default_max_year = current_year

min_year = st.sidebar.number_input("Min Year", min_value=1900, max_value=current_year - 1, value=default_min_year)
max_year = st.sidebar.number_input("Max Year", min_value=min_year + 1, max_value=current_year, value=default_max_year)

# Session state for year and month
if "year" not in st.session_state:
    st.session_state.year = default_max_year
if "month" not in st.session_state:
    st.session_state.month = 1

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

# Main UI
st.title("🎬 Top 5 Movies by Month")
st.write("Select a year and month to see the most popular movies released during that time.")

col1, col2 = st.columns(2)
with col1:
    year = st.number_input("Year", min_value=min_year, max_value=max_year, value=st.session_state.year, key="year_input")
with col2:
    month = st.selectbox("Month", list(range(1, 13)), index=st.session_state.month - 1,
                         format_func=lambda m: datetime(1900, m, 1).strftime('%B'), key="month_input")

# Action buttons
col3, col4 = st.columns([1, 1])
get_clicked = col3.button("Get Movies")
random_clicked = col4.button("🎲 Random")

# Handle Random button
if random_clicked:
    st.session_state.year = random.randint(min_year, max_year)
    st.session_state.month = random.randint(1, 12)
    st.rerun()

# Handle Get Movies button
if get_clicked:
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