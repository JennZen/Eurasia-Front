import { useState, useEffect } from "react";

export const useLikes = () => {
  const [likes, setLikes] = useState([]);

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
  }, []);

  const toggleLike = (attractionId) => {
    setLikes((prevLikes) => {
      const isLiked = prevLikes.includes(attractionId);
      const newLikes = isLiked
        ? prevLikes.filter((id) => id !== attractionId)
        : [...prevLikes, attractionId];
      
      localStorage.setItem("likedAttractions", JSON.stringify(newLikes));
      return newLikes;
    });
  };

  const isLiked = (attractionId) => likes.includes(attractionId);

  return { likes, toggleLike, isLiked };
};
