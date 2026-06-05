export function gradeColor(grade) {
  switch (grade) {
    case 'ground-truth': return '#2d8a4e'
    case 'corroborated': return '#c9962b'
    case 'synthetic': return '#c0392b'
    default: return '#888888'
  }
}
