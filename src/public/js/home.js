window.addEventListener('DOMContentLoaded', () => {
  // Get values from DOM
  const greenBits = parseInt(document.getElementById('greenBits')?.textContent) || 0;
  const streakCount = parseInt(document.getElementById('streakCount')?.textContent) || 0;
  const leaderboardPoints = parseInt(document.getElementById('leaderboardPoints')?.textContent) || 0;
  const carbonSaved = parseFloat(document.getElementById('carbonSaved')?.textContent) || 0;
  const wasteRecycled = parseFloat(document.getElementById('wasteRecycled')?.textContent) || 0;

  // Calculate total impact
  const totalImpact = carbonSaved + wasteRecycled;
  const totalImpactElem = document.getElementById('totalImpact');
  if (totalImpactElem) {
    totalImpactElem.textContent = totalImpact + ' kg';
  }

  // Calculate user level based on GreenBits
  let level = 'Beginner';
  if (greenBits > 1000) level = 'Eco Master';
  else if (greenBits > 500) level = 'Eco Pro';
  else if (greenBits > 100) level = 'Eco Enthusiast';

  // Show user level
  const userLevelElem = document.getElementById('userLevel');
  if (userLevelElem) {
    userLevelElem.innerHTML = `<strong>Level:</strong> ${level}`;
  }
});