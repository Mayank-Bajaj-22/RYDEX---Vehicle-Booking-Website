"use client"

import { ArrowLeftIcon, BadgeCheck, CheckCircle, CreditCard, IdCard, Landmark, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'

function page() {

    const router = useRouter();

    return (
        <div className='min-h-screen bg-white flex items-center justify-center px-4'>
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='w-full max-w-xl bg-white rounded-3xl border border-gray-200 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.15)] sm:p-8'
            >
                <div className='relative text-center'>
                    <button className='absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition' onClick={() => router.back()}>
                        <ArrowLeftIcon size={18} />
                    </button>

                    <p className='text-xs text-gray-500 font-medium'>
                        step 3 of 3
                    </p>

                    <h1 className='text-2xl font-bold mt-1'>
                        Bank & Payout Setup
                    </h1>

                    <p className='text-sm text-gray-500 mt-2'>
                        Used for partner payouts
                    </p>
                </div>

                <div className='mt-8 space-y-6'>
                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            Account Holder Name
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><BadgeCheck /></div>
                            <input type="text" id='ahn' placeholder='As per bank records' className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            Bank Account Number
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><CreditCard /></div>
                            <input type="text" id='ahn' placeholder='Enter your bank account number' className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            IFSC Code
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><Landmark /></div>
                            <input type="text" id='ahn' placeholder='Enter IFSC code, eg: SBIN0002499' className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            Mobile Number
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><Phone /></div>
                            <input type="text" id='ahn' placeholder='10 digit mobile number' className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            UPI ID (Optional)
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><IdCard /></div>
                            <input type="text" id='ahn' placeholder='name@upi' className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black" />
                        </div>
                    </div>
                </div>

                <div className='mt-6 flex items-start gap-3 text-xs text-gray-500'>
                    <CheckCircle size={16} className='mt-0.5' />
                    <p>
                        Bank details are verified before first payout. This usually takes 24-28 hours.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-8 w-full h-14 bg-black rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                >
                    Continue
                </motion.button>
            </motion.div>
        </div>
    )
}

export default page;