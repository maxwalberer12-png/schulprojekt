// Test Rechendreieck math and SVG coordinates
function solveRechendreieck(ecken, aussen) {
  const e = [...ecken];
  const a = [...aussen];

  // If all 3 corners are given, calculate all outer fields
  if (e[0] != null && e[1] != null && e[2] != null) {
    if (a[0] == null) a[0] = e[0] + e[1];
    if (a[1] == null) a[1] = e[1] + e[2];
    if (a[2] == null) a[2] = e[2] + e[0];
  }
  // If outer fields and 1 corner are given, solve for missing
  return { ecken: e, aussen: a };
}

const sample1 = solveRechendreieck([5, 3, 8], [8, null, 11]);
console.log('Sample 1 solved:', sample1);
