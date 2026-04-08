import { useState, useEffect } from "react";

export const useLikes = () => {
  const [likes, setLikes] = useState([]);
  const [countryLikes, setCountryLikes] = useState([]);

  useEffect(() => {
    const storedLikes = localStorage.getItem("likedAttractions");
    if (storedLikes) {
      try {
        setLikes(JSON.parse(storedLikes));
      } catch (error) {
        console.error("Error parsing liked attractions:", error);
        setLikes([]);
      }
    }

    const storedCountryLikes = localStorage.getItem("likedCountries");
    if (storedCountryLikes) {
      try {
        setCountryLikes(JSON.parse(storedCountryLikes));
      } catch (error) {
        console.error("Error parsing liked countries:", error);
        setCountryLikes([]);
      }
    }
  }, []);

  const toggleLike = (attractionId) => {
    setLikes((prevLikes) => {
      const isLikedNow = prevLikes.includes(attractionId);
      const newLikes = isLikedNow
        ? prevLikes.filter((id) => id !== attractionId)
        : [...prevLikes, attractionId];

      localStorage.setItem("likedAttractions", JSON.stringify(newLikes));
      return newLikes;
    });
  };

  const isLiked = (attractionId) => likes.includes(attractionId);

  const toggleCountryLike = (countryName) => {
    setCountryLikes((prev) => {
      const isLikedNow = prev.includes(countryName);
      const newLikes = isLikedNow
        ? prev.filter((n) => n !== countryName)
        : [...prev, countryName];

      localStorage.setItem("likedCountries", JSON.stringify(newLikes));
      return newLikes;
    });
  };

  const isCountryLiked = (countryName) => countryLikes.includes(countryName);

  return { likes, toggleLike, isLiked, countryLikes, toggleCountryLike, isCountryLiked };
};
