export default handleOrientation

function handleOrientation(event) {
  const alpha = event.alpha
  const beta = event.beta
  const gamma = event.gamma
  
  console.log('alpha', alpha)
  console.log('beta', beta)
  console.log('gamma', gamma)
  console.log(event)
}
