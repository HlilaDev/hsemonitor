module.exports = function parseSound(payload) {
  const value = Number(payload.value ?? payload.sound ?? payload.intensity);

  if (Number.isNaN(value)) {
    throw new Error("Invalid SOUND payload");
  }

  let level = "normal";

  if (value >= 750) {
    level = "critical";
  } else if (value >= 500) {
    level = "high";
  } else if (value >= 300) {
    level = "medium";
  }

  return {
    values: {
      sound: value,
      level,
      unit: payload.unit || "raw"
    },
    raw: payload
  };
};