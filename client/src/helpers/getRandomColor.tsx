const getRandomColor = () => {
  return (
    "hsl(" +
    360 * Math.random() +
    "," +
    (20 + 75 * Math.random()) +
    "%," +
    (10 + 60 * Math.random()) +
    "%)"
  );
};

export default getRandomColor;

// from stackoverflow.com/questions/43193341/how-to-generate-random-pastel-or-brighter-color-in-javascript
