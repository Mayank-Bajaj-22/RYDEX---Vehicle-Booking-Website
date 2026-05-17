"use client"

import { useState } from 'react'
import AuthModal from './AuthModal'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'

function PublicHome() {

    const [authOpen, setAuthOpen] = useState(false);

    return (
        <>
            <HeroSection />
            <VehicleSlider />
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default PublicHome;