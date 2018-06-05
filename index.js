const record = require('node-record-lpcm16')
const speech = require('@google-cloud/speech')
const fs = require('fs')

const FILE_NAME = 'voice.wav'

const file = fs.createWriteStream(FILE_NAME, { encoding: 'binary' })

record
  .start({
    verbose: true
  })
  .pipe(file)

setTimeout(recordDone, 3000)

function recordDone() {
  record.stop()
  const client = new speech.SpeechClient()

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(FILE_NAME)
  const audioBytes = file.toString('base64')

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes
  }
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US'
  }
  const request = {
    audio: audio,
    config: config
  }

  // Detects speech in the audio file
  client
    .recognize(request)
    .then(data => {
      const response = data[0]
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n')
      console.log(`Transcription: ${transcription}`)
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}
