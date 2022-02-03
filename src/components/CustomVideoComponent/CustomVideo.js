import React, { useRef, useState } from 'react';

const CustomVideoComponent = (props) => {
    const record = props.record;
    const recordingEnabled = props.recordingEnabled;
    const stopRecording = props.stopRecording;
    const mediaURL = props.mediaURL;
    const width = props.width;

    const videoRef = useRef(null);

    const [started, setStart] = useState(false);

    return recordingEnabled ? 
    <video ref={videoRef} src={mediaURL}
        controls
        onPause={() => pause(videoRef.current)}
        width={width}
        onPlay={() => {
            if(!started){
                record();
                setStart(true);
            }
        }}
        onEnded={() => {
            stopRecording();
            setStart(false);
        }} />
        :
    <video ref={videoRef} src={mediaURL}
        controls
        width={width}/>

}

const pause = videoRefCurrent => {
    if (videoRefCurrent.currentTime != videoRefCurrent.duration)
        videoRefCurrent.play()
}

export default CustomVideoComponent;