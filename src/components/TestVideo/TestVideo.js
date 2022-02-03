import { Button, Card, makeStyles, Modal } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";

const styles = makeStyles(theme => ({
    cameraBox: {
        borderRadius: "5px",
        display: "flex",
        overflow: "hidden"
    },
    modalBox: {
        display: "flex",
        padding: "15px",
        flexDirection: "column",
        borderRadius: "5px"
    }
}))

const ModalContent = (props) => {
    const videoRef = useRef(null);
    const classes = styles();

    let close = props.close;

    useEffect(() => {
        getVideo();
    }, [videoRef]);

    const getVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 }, audio: true })
            .then(stream => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error("error:", err);
            });
    };

    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}>
            <div style={{ display: "flex" }}>
                <Card className={classes.modalBox}>
                    <div style={{ display: "flex" }}>
                        <div className={classes.cameraBox}>
                            <video ref={videoRef} audio />
                        </div>
                    </div>
                    <Button onClick={close}>Close</Button>
                </Card>
            </div>
        </div>
    );
};

const TestVideo = () => {
    const [isOpen, setOpen] = useState(false);

    return (
        <div>
            <Button variant="outlined" type="button" onClick={() => setOpen(true)}>
                Test Video
            </Button>
            <Modal
                open={isOpen}
                onClose={() => setOpen(false)}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <ModalContent close={() => setOpen(false)} />
            </Modal>
        </div>
    )
}
export default TestVideo;