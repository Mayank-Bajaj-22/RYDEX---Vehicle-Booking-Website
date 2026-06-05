"use client"

import { RootState } from '@/redux/store';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

function page() {

    const containerRef = useRef<HTMLDivElement>(null);

    const { userData } = useSelector((state: RootState) => state.user)

    const startCall = async () => {
        if (!containerRef) {
            return null;
        }
        try {
            const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appId,
                serverSecret!,
                "njfbifjbjfb",
                userData?._id.toString()!,
                "ayush"
            )
            
            const zp = ZegoUIKitPrebuilt.create(kitToken);

            zp.joinRoom({
                container: containerRef.current,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showPreJoinView: false
            });
        } catch (error) {
            console.error('Error starting call:', error);
        }
    }

    return (
        <div ref={containerRef} className='h-screen'>
            <button onClick={startCall}>CLICK</button>
        </div>
    )
}

export default page