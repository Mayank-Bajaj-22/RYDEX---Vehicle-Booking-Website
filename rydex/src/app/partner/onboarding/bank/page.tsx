"use client"

import axios from 'axios';
import { ArrowLeftIcon, BadgeCheck, CheckCircle, CircleDashed, CreditCard, IdCard, Landmark, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function page() {

    const router = useRouter();
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [upi, setUpi] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const sanitizedIfsc =  ifscCode.trim().toUpperCase();

    const isNameValid = accountHolder.trim().length >= 3;
    const isAccountNumberValid = accountNumber.trim().length >= 9;
    const isIfscValid = IFSC_REGEX.test(sanitizedIfsc);
    const isMobileNumberValid = mobileNumber.trim().length === 10 && /^\d+$/.test(mobileNumber);
    const isUpiValid = upi.trim().includes('@');

    const canSubmit = isNameValid && isAccountNumberValid && isIfscValid && isMobileNumberValid;

    const handleBank = async () => {
        setError('');
        setLoading(true)
        try {
            const { data } = await axios.post("/api/partner/onboarding/bank", {
                accountHolder,
                accountNumber,
                ifscCode: sanitizedIfsc,
                mobileNumber,
                upi
            })
            setLoading(false)
            // console.log(data);
            router.push("/")
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "something went wrong");
            // console.log(error);
            setLoading(false);
        }
    }

    const handleGetBank = async () => {
        try {
            const { data } = await axios.get("/api/partner/onboarding/bank")
            // console.log(data);
            setAccountHolder(data.partnerBank.accountHolder);
            setAccountNumber(data.partnerBank.accountNumber);
            setIfscCode(data.partnerBank.ifscCode);
            setUpi(data.partnerBank.upi || '');
            setMobileNumber(data.mobileNumber || '');
        } catch (error: any) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleGetBank();
    }, [])

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
                            <input 
                                type="text" 
                                id='ahn' 
                                placeholder='As per bank records' 
                                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isNameValid && accountHolder.length > 0 ?"border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`} 
                                value={accountHolder} 
                                onChange={(e) => setAccountHolder(e.target.value)} 
                            />
                        </div>

                        {
                            !isNameValid && accountHolder.length > 0 && <p className='mt-1 text-xs ml-8 text-red-500'>Minimum 3 characters required</p>
                        }
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            Bank Account Number
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><CreditCard /></div>
                            <input 
                                type="text" 
                                id='ahn' 
                                placeholder='Enter your bank account number' 
                                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isAccountNumberValid && accountNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={accountNumber} 
                                onChange={(e) => setAccountNumber(e.target.value)} 
                            />
                        </div>

                        {
                            !isAccountNumberValid && accountNumber.length > 0 && <p className='mt-1 text-xs ml-8 text-red-500'>Account number must be at least 9 characters long</p>
                        }
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            IFSC Code
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><Landmark /></div>
                            <input 
                                type="text" 
                                id='ahn' 
                                placeholder='Enter IFSC code, eg: SBIN0002499' 
                                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isIfscValid && ifscCode.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`} 
                                value={ifscCode.toUpperCase()}
                                onChange={(e) => setIfscCode(e.target.value)} 
                            />
                        </div>

                        {
                            !isIfscValid && ifscCode.length > 0 && <p className='mt-1 text-xs ml-8 text-red-500'>Invalid IFSC code</p>
                        }
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            Mobile Number
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><Phone /></div>
                            <input 
                                type="text" 
                                id='ahn' 
                                placeholder='10 digit mobile number' 
                                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isMobileNumberValid && mobileNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={mobileNumber} 
                                onChange={(e) => setMobileNumber(e.target.value)} 
                            />
                        </div>

                        {
                            !isMobileNumberValid && mobileNumber.length > 0 && <p className='mt-1 text-xs ml-8 text-red-500'>Enter a valid 10-digit mobile number</p>
                        }
                    </div>

                    <div>
                        <label htmlFor='ahn' className='text-xs font-semibold text-gray-500'>
                            UPI ID (Optional)
                        </label>

                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-400'><IdCard /></div>
                            <input type="text" id='ahn' placeholder='name@upi' className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black" value={upi} onChange={(e) => setUpi(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className='mt-6 flex items-start gap-3 text-xs text-gray-500'>
                    <CheckCircle size={16} className='mt-0.5' />
                    <p>
                        Bank details are verified before first payout. This usually takes 24-28 hours.
                    </p>
                </div>

                {
                    error && <p className='text-center text-sm text-red-500 mt-3 -mb-3'>
                    *{ error }
                </p>
                }

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-8 w-full h-14 bg-black rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                    disabled={!canSubmit || loading}
                    onClick={handleBank}
                >
                    { loading ? <CircleDashed className="animate-spin text-white" /> : "Save and Continue" }
                </motion.button>
            </motion.div>
        </div>
    )
}

export default page;