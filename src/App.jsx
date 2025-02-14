import React, { useState, useEffect } from "react";
import "./App.css";
import { Commet } from "react-loading-indicators";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

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

    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    try {
      // Fetch user data
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`,
        { headers }
      );
      if (!userResponse.ok) throw new Error("User not found");
      const userData = await userResponse.json();
      setUserData(userData);

      // Fetch repositories
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100`,
        { headers }
      );
      if (!reposResponse.ok) throw new Error("Repositories not found");
      const reposData = await reposResponse.json();

      // Sort repositories by stars (descending) and take the top 5
      const sortedRepos = reposData
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5);

      setRepos(sortedRepos);
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

      {loading && <Commet color="#32cd32" size="small" text="" textColor="" />}
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
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>
                <p>⭐ Stars: {repo.stargazers_count}</p>
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
