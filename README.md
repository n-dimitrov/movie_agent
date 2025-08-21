# 🎬 Movie Discovery Agent

A Streamlit-powered web application that helps you discover popular movies from any month and year using The Movie Database (TMDb) API.

## ✨ Features

- **Time-based Discovery**: Find the top 5 most popular movies from any specific month and year
- **Smart Defaults**: Automatically defaults to the current month and year for immediate relevance
- **Random Discovery**: Get surprised with movies from a random time period
- **Rich Movie Information**: View movie posters, ratings, release dates, and detailed overviews
- **Responsive Design**: Wide layout optimized for displaying movie content
- **Year Range Configuration**: Customizable year range (default: 1978 - current year)

## 🚀 Getting Started

### Prerequisites

- Python 3.7+
- TMDb API key (free registration at [themoviedb.org](https://www.themoviedb.org/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/n-dimitrov/movie_agent.git
cd movie_agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your TMDb API key:
   - Create a `.streamlit` folder in the project root
   - Create a `secrets.toml` file inside `.streamlit/`
   - Add your API key:
```toml
[tmdb]
api_key = "your_tmdb_api_key_here"
```

### Running the App

```bash
streamlit run app.py
```

The app will open in your default browser at `http://localhost:8501`

## 🎯 How to Use

1. **Configure Settings**: Use the sidebar to set your preferred year range
2. **Select Time Period**: Choose a year and month to explore
3. **Discover Movies**: Click "Get Movies" to see the top 5 popular movies from that period
4. **Random Discovery**: Click the "🎲 Random" button for surprise recommendations
5. **Explore Details**: View movie posters, ratings, and detailed information

## 🛠️ Technical Details

- **Framework**: Streamlit
- **API**: The Movie Database (TMDb) API v3
- **Data**: Movie popularity, release dates, ratings, and metadata
- **Layout**: Wide responsive design with expandable sidebar

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/n-dimitrov/movie_agent/issues).

---

**Note**: This application requires a valid TMDb API key. The API key should be kept secure and not committed to version control.