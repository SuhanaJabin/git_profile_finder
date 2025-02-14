import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserData = async () => {
    if (!username) return;

    setLoading(true);
    setError("");

    try {
      // Fetch user details
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`
      );
      if (!userResponse.ok) throw new Error("User not found");
      const userData = await userResponse.json();
      setUserData(userData);

      // Fetch top 5 repositories
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?sort=stars&per_page=5`
      );
      if (!reposResponse.ok) throw new Error("Repositories not found");
      const reposData = await reposResponse.json();
      setRepos(reposData);
    } catch (err) {
      setError(err.message);
      setUserData(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  return (
    <div className="App">
      <h1>GitHub User Finder</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={fetchUserData}>Search</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {userData && (
        <div className="profile-container">
          <div className="profile">
            <img src={userData.avatar_url} alt="Profile" />
            <h2>{userData.name || userData.login}</h2>
            <p>{userData.bio}</p>
            <p>Followers: {userData.followers}</p>
          </div>

          <div className="repositories">
            <h3>Top 5 Repositories</h3>
            {repos.map((repo) => (
              <div key={repo.id} className="repo">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repo.name}
                </a>
                <p>Stars: {repo.stargazers_count}</p>
                <p>{repo.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;