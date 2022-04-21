import './index.css'
// eslint-disable-next-line 
import React, { Component }  from 'react';
import { useState, useEffect } from 'react'
import { supabase } from './config/supabase'
import Auth from './components/auth/Auth';
import Account from './components/account/Account';


export default function Home() {
  const [session, setSession] = useState(null)
  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        {!session ? <Auth /> : <Account key={session.user.id} session={session} />}
      </div>
      
  )
}