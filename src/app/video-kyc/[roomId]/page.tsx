"use client"

import { RootState } from '@/redux/store';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { CheckCircle, Mic, MicOff, PhoneOff, Video, VideoOff, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

function page() {

    const containerRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLVideoElement>(null);
    const [joined, setJoined] = useState(false )
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [loading, setLoading] = useState(false)

    const { userData } = useSelector((state: RootState) => state.user)

    const { roomId } = useParams();

    useEffect(() => {
        if (joined) return;

        let localStream: MediaStream
        const init = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                setStream(localStream)

                if (previewRef.current) {
                    previewRef.current.srcObject = localStream
                }
            } catch (error) {
                console.log(error)
            }
        }

        init()
    }, [])

    const toggleCamera = () => {
        if (!stream) return;

        stream.getVideoTracks().forEach((track) => track.enabled = !isCameraOn)
        setIsCameraOn(!isCameraOn)
    }

    const toggleMic = () => {
        if (!stream) return;

        stream.getAudioTracks().forEach((track) => track.enabled = !isMicOn)
        setIsMicOn(!isMicOn)
    }

    const displayName = userData?.role == "admin" ? "Admin" : `${userData?.name} (${userData?.email})`

    const startCall = async () => {
        if (!containerRef) {
            return null;
        }

        setLoading(true)
        try {
            const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appId,
                serverSecret!,
                roomId?.toString()!,
                userData?._id.toString()!,
                displayName
            )
            
            const zp = ZegoUIKitPrebuilt.create(kitToken);

            zp.joinRoom({
                container: containerRef.current,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showPreJoinView: false
            });
            setJoined(true);
            setLoading(false)
        } catch (error) {
            console.error('Error starting call:', error);
        }
    }

    return (
        <div className='min-h-screen bg-black text-white flex flex-col'>
            <div className='px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <Image src={"/logo.png"} alt="logo" width={44} height={44} priority className='w-auto' />
                    <p>
                        { userData?.role == "admin" ? "Admin Verification" : "Partner Video KYC" }
                    </p>
                </div>

                {
                    joined && (
                        <div className='flex flex-wrap gap-3'>
                            {
                                userData?.role === "admin" && (
                                    <>
                                        <button className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2'>
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2'>
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </>
                                )
                            }

                            <button className='bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2'>
                                <PhoneOff size={16} /> End Call
                            </button>
                        </div>
                    )
                }
            </div>

            <div className='flex-1 relative'>
                <div 
                    ref={containerRef} 
                    className={`absolute inset-0 ${joined ? "block" : "hidden"}`}
                />
                {
                    !joined && (
                        <div className='h-full flex items-center justify-center px-4 py-10'>
                            <div className='w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                                <div className='relative rounded-2xl overflow-hidden border border-white/10 bg-white/5'>
                                    <video 
                                        ref={previewRef} 
                                        autoPlay
                                        playsInline
                                        className='w-full h-75 sm:h-100 object-cover'
                                    /> 

                                    {
                                        !isCameraOn && (
                                            <div className='absolute inset-0 bg-black flex items-center justify-center'>
                                                <VideoOff size={40} />
                                            </div>
                                        )
                                    }
                                </div>

                                <div className='space-y-8 text-center lg:text-left'>
                                    <h1 className='text-3xl sm:text-4xl font-bold'>
                                        Secure Video KYC
                                    </h1>

                                    <div className='flex justify-center lg:justify-start gap-6'>
                                        <button className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isCameraOn ? "bg-white text-black" : "bg-white/10 border-white/20"}`} onClick={toggleCamera}>
                                            {
                                                isCameraOn 
                                                ? <Video />
                                                : <VideoOff />
                                            }
                                        </button>
                                        
                                        <button className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMicOn ? "bg-white text-black" : "bg-white/10 border-white/20"}`} onClick={toggleMic}>
                                            {
                                                isMicOn 
                                                ? <Mic />
                                                : <MicOff />
                                            }
                                        </button>
                                    </div>

                                    <button
                                        onClick={startCall}
                                        className='w-full bg-white text-black py-4 rounded-xl font-semibold'
                                        disabled={loading}
                                    >
                                        { loading ? "Connecting..." : "Join Secure Call" }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default page