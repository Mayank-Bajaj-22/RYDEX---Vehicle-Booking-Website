"use client"

import { RootState } from '@/redux/store'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useSelector } from 'react-redux'
import { Check, Clock, Lock, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RejectionCard from './RejectionCard'
import StatusCard from './StatusCard'
import ActionCard from './ActionCard'

type Step = {
    id: number
    title: string
    route?: string
}

const STEPS: Step[] = [
    { id: 1, title: 'Vehicle', route: '/partner/onboarding/vehicle' },
    { id: 2, title: 'Documents', route: '/partner/onboarding/documents' },
    { id: 3, title: 'Bank', route: '/partner/onboarding/bank' },
    { id: 4, title: 'Review' },
    { id: 5, title: 'Video KYC' },
    { id: 6, title: 'Pricing' },
    { id: 7, title: 'Final Review' },
    { id: 8, title: 'Live' }
]

const TOTAL_STEPS = STEPS.length;

function PartnerDashboard() {

    const [activeStep, setActiveStep] = useState(0);

    const { userData } = useSelector((state: RootState) => state.user);

    const router = useRouter();

    useEffect(() => {
        if (userData) {
            setActiveStep(userData.partnerOnboardingStep + 1);
        }
    }, [userData])

    const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

    const goToStep = (step: Step) => {
        if (step.route && step.id <= activeStep) {
            router.push(step.route);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
            <div className="max-w-7xl mx-auto space-y-16">
                <div>
                    <h1 className='text-4xl font-bold'>
                        Partner Onboarding
                    </h1>
                    <p className='mt-3 text-gray-600'>
                        Complete all steps to activate your account
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
                    <div className="relative min-w-200">
                        <div className="absolute top-7 left-0 w-full h-0.75 bg-gray-200 rounded-full" /> 
                        <motion.div
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.6 }}
                            className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
                        />
                        <div className="relative flex justify-between">
                            { STEPS.map((s, i) => {
                                const completed = s.id < activeStep;
                                const isActive = s.id == activeStep;
                                const locked = s.id > activeStep;   
                                return (
                                    <motion.div
                                        key={s.id}
                                        whileHover={ !locked ? { scale: 1.1 } : {} }
                                        onClick={() => goToStep(s)}
                                        className="flex flex-col items-center z-10 cursor-pointer"
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${completed ? "bg-black text-white border-black" : isActive ? "border-black bg-white" : "border-gray-300 bg-white text-gray-400"}`}>
                                            {
                                                completed ? (
                                                    <Check size={20} />
                                                ) : locked ? (
                                                    <Lock size={20} />
                                                ) : (
                                                    s.id
                                                )
                                            }
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-center">
                                            { s.title }
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {
                    activeStep == 4 && userData?.partnerStatus == "rejected" && (
                        <RejectionCard 
                            title="Partner Rejected"
                            reason={userData.rejectionReason}
                            actionLabel={`Review and update`}
                            onAction={() => {
                                router.push("/partner/onboarding/vehicle")
                            }}
                        />
                    )
                }

                {
                    activeStep == 4 && userData?.partnerStatus == "pending" && (
                        <StatusCard 
                            title="Documents Under Review"
                            icon={<Clock size={18} />}
                            desc="Admin is verifying your documents."
                        />
                    )
                }

                {
                    activeStep == 5 && (
                        userData?.videoKycStatus == "approved" ? (
                            <StatusCard 
                                icon={<Check size={18} />}
                                title="Video KYC Approved"
                                desc="You can now proceed to pricing."
                            />
                        ) : userData?.videoKycStatus == "rejected" ? (
                            <RejectionCard 
                                title="Video KYC Rejected"
                                reason={userData.videoKycRejectionReason}
                                actionLabel={`Request Again`}
                            />
                        ) : userData?.videoKycStatus == "in_progress" && userData?.videoKycRoomId ? (
                            <ActionCard
                                icon={<Video size={18} />}
                                title="Admin Started Video KYC"
                                button="Join Call"
                                onClick={() => {
                                    router.push(`/video-kyc/${userData.videoKycRoomId}`)
                                }}
                            />
                        ) : (
                            <StatusCard 
                                icon={<Clock size={18} />}
                                title="Waiting for Admin"
                                desc="Admin will initiate Video KYC shortly."
                            />
                        )
                    )
                }
            </div>
        </div>
    )
}

export default PartnerDashboard