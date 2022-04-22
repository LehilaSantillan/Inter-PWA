import i18next from 'i18next';
import { useState, useEffect } from 'react';
import Avatar from "../avatar";
import { supabase } from '../../config/supabase';
import React, { Component }  from 'react';

export default function Account({ session }) {
    const [loading, setLoading] = useState(true);
    const [description, setCDescription] = useState(null);
    const [title, setTitle] = useState(null);
    const [recordDate, setRecordDate] = useState(new Date());
    const [creationDate,setCreationDate]=useState(null);
    const [isFetch, setIsFetch] = useState(false);
    const [dateID, setDateID] = useState(null);
    const [userid] = useState(supabase.auth.user());
    const [listRecords,setListRecords]=useState(null);
    useEffect(() => {
        if (avatar_url) downloadImage(avatar_url)
        getProfile()
        listrecord()
    }, [session, avatar_url, isFetch])
    
    async function listrecord() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('dates')
                .select(`*`)
                .eq('user', user.id)


            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setListRecords(data);

            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function getRecord() {
        try {

            let { data, error, status } = await supabase
                .from('dates')
                .select(`*`)
                .eq('id', dateID)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setTitle(data.title);
                setCDescription(data.description);
                setRecordDate(data.remind_date);
                setCreationDate(data.created_at);
            }
        } catch (error) {
            alert(error.message)
        } finally {

        }
    }

    <h1>{i18next.t("field9")}</h1>
            {listRecords!== null ? listRecords.map((t) => <li key={t.id}> {i18next.t("record1")} {t.id} {i18next.t("record2")} {t.title} - {i18next.t("record3")} {t.content} - {i18next.t("record4")} {t.reminder} - {i18next.t("record5")} {t.created_at} -</li>):""}
     
}