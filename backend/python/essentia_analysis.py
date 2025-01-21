import essentia.standard as es
import essentia.streaming as ess
import essentia
import json
import sys

def estimate_bpm(file_path):
    # Load the audio file
    audio = es.MonoLoader(filename=file_path)()

    # Compute beat positions and BPM
    rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)

    return {
        "bpm": bpm,
        "beats_confidence": beats_confidence
    }

def estimate_key(file_path):
    # Initialize streaming algorithms for key estimation
    loader = ess.MonoLoader(filename=file_path)
    framecutter = ess.FrameCutter(frameSize=4096, hopSize=2048, silentFrames='noise')
    windowing = ess.Windowing(type='blackmanharris62')
    spectrum = ess.Spectrum()
    spectralpeaks = ess.SpectralPeaks(orderBy='magnitude',
                                      magnitudeThreshold=0.00001,
                                      minFrequency=20,
                                      maxFrequency=3500,
                                      maxPeaks=60)

    hpcp_key = ess.HPCP(size=36,  # Higher resolution for key estimation
                        referenceFrequency=440,
                        bandPreset=False,
                        minFrequency=20,
                        maxFrequency=3500,
                        weightType='cosine',
                        nonLinear=False,
                        windowSize=1.)

    key = ess.Key(profileType='edma',  # Profile for electronic music
                  numHarmonics=4,
                  pcpSize=36,
                  slope=0.6,
                  usePolyphony=True,
                  useThreeChords=True)

    # Use pool to store data
    pool = essentia.Pool()

    # Connect streaming algorithms
    loader.audio >> framecutter.signal
    framecutter.frame >> windowing.frame >> spectrum.frame
    spectrum.spectrum >> spectralpeaks.spectrum
    spectralpeaks.magnitudes >> hpcp_key.magnitudes
    spectralpeaks.frequencies >> hpcp_key.frequencies
    hpcp_key.hpcp >> key.pcp
    key.key >> (pool, 'tonal.key_key')
    key.scale >> (pool, 'tonal.key_scale')
    key.strength >> (pool, 'tonal.key_strength')

    # Run streaming network
    essentia.run(loader)

    return {
        "key": pool['tonal.key_key'],
        "scale": pool['tonal.key_scale'],
        "strength": pool['tonal.key_strength']
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    try:
        file_path = sys.argv[1]

        # Perform both analyses
        bpm_result = estimate_bpm(file_path)
        key_result = estimate_key(file_path)

        # Combine results and output as JSON
        result = {
            "bpm_analysis": bpm_result,
            "key_analysis": key_result
        }
        print(json.dumps(result))  # Output JSON

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
