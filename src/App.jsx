import React, { useState,useEffect } from "react";
import { Commet } from "react-loading-indicators";
import "./App.css";
import Lenis from "@studio-freight/lenis";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

function App() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const fetchUserData = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    setError("");

    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    try {
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`,
        { headers }
      );
      if (!userResponse.ok) throw new Error("User not found");
      const userData = await userResponse.json();
      setUserData(userData);

      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100`,
        { headers }
      );
      if (!reposResponse.ok) throw new Error("Repositories not found");
      const reposData = await reposResponse.json();

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

  return (
    <div className="flex flex-col tracking-wider items-center justify-center min-h-screen bg-gray-950 p-6 text-gray-300">
      <h1 className="text-5xl mt-10 tracking-wider mb-14 text-teal-400">
        DevHub : Discover GitHub Wizards
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 border border-gray-700 rounded-md w-100 bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 tracking-wider focus:ring-teal-500"
        />
        <button
          onClick={fetchUserData}
          className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition duration-300"
        >
          Search
        </button>
      </div>

      {loading && <Commet color="#14B8A6" size="small" text="" textColor="" />}
      {error && <p className="text-red-400 mt-4">{error}</p>}

      {userData && (
        <div className="w-full max-w-lg p-6 rounded-lg shadow-md bg-gray-900 hover:bg-gray-800 transition duration-700">
          <img
            src={userData.avatar_url}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-teal-500"
          />
          <h2 className="text-xl tracking-wider text-gray-100 text-center">
            {userData.name || userData.login}
          </h2>
          <p className="text-gray-400 text-center">{userData.bio}</p>
          <p className="text-gray-300 mt-2 text-center">Followers: {userData.followers}</p>
        </div>
      )}

{repos.length > 0 ? (
          <div className="w-full max-w-lg mt-6">
            <h3 className="text-lg font-semibold tracking-wider mb-4 text-teal-400">
              Top 5 Repositories
            </h3>
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="bg-gray-800 p-6 rounded-lg shadow-md mb-4"
              >
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 font-semibold hover:underline"
                >
                  {repo.name}
                </a>
                <p className="text-gray-300">⭐ Stars: {repo.stargazers_count}</p>
                <p className="text-gray-400">{repo.description}</p>
              </div>
            ))}
          </div>
        ) : userData && (
          <p className="text-gray-400 mt-4">No repositories</p>
        )}
    </div>
  );
}

export default App;
