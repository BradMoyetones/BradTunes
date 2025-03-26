export default function Greeting() {
  const currentTime = new Date()
  const currentHour = currentTime.getHours()

  let greeting = ""

  if (currentHour < 12) {
    greeting = "Buenos días"
  } else if (currentHour < 18) {
    greeting = "Buenas tardes"
  } else {
    greeting = "Buenas noches"
  }
  
  return (
    <h1 className="text-3xl font-bold text-primary-foreground">{greeting}</h1>
  )
}