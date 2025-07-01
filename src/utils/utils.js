function getHumanReadableTime(minutesInput) {
    const minutes = Math.floor(minutesInput);
  
    const years = Math.floor(minutes / (60 * 24 * 365));
    const months = Math.floor((minutes % (60 * 24 * 365)) / (60 * 24 * 30));
    const days = Math.floor((minutes % (60 * 24 * 30)) / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
  
    const parts = [];
  
    if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (mins || parts.length === 0) parts.push(`${mins} minute${mins > 1 ? 's' : ''}`);
  
    return parts.join(' ');
  }
  
  module.exports = {
    getHumanReadableTime
  };  