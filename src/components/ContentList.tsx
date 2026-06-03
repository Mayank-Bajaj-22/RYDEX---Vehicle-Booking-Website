"use client"

import { CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'

function ContentList({ data, type}: any) {

    if (data?.length == 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl py-16 text-center border border-dashed border-gray-200 shadow-sm"
            >
                <div className='w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4'>
                    <CheckCircle2 size={22} className='text-green-400' />
                </div>

                <p className='font-bold text-gray-800 text-base'>
                    All caught up!
                </p>

                <p className='text-sm text-gray-400 mt-1'>
                    No pending items right now.
                </p>
            </motion.div>
        )
    }
    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between px-1 mb-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
                    { type == "partner" ? "Partner Reviews Queue" : type == "kyc" ? "Pending Video KYC Queue" : "Vehicle Reviews Queue" }
                </p>

                <p className='text-xs text-gray-400'>
                    {data.length} items
                </p>
            </div>
        </div>
    )
}

export default ContentList