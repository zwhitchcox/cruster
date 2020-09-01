const second = async () => {
  throw new Error("double nested")
}

const first = async () => {
  await second()
}

;(async () => {
  try {
    await first()
  } catch (err) {
    console.log(`Nested Error: ${err.toString()}`)
  }
})()

