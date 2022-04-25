import i18next from 'i18next';
import { useState, useEffect } from 'react';
import Avatar from "../avatar";
import { supabase } from '../../config/supabase';


export default function Account({ session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState(null)
    const [consulting_room, setConsultingroom] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)
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


    async function downloadImage(path) {
        try {
            const {  error } = await supabase.storage.from('avatars').download(path)
            if (error) {
                throw error
            }

        } catch (error) {
            console.log('Error downloading image: ', error.message)
        }
    }
    async function getProfile() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, consulting_room, avatar_url`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.username)
                setConsultingroom(data.consulting_room)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function deleteRecord() {
        try {
            const { error } = await supabase
                .from('dates')
                .delete()
                .eq('id', dateID)
            if (error) {
                throw error
            } else {
                setIsFetch(true);
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setIsFetch(false);
        }
    }


    async function updateProfile({ username, consulting_room, avatar_url }) {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            const updates = {
                id: user.id,
                username,
                consulting_room,
                avatar_url,
                updated_at: new Date(),
            }

            let { error } = await supabase.from('profiles').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                throw error
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function insertRecord({ title, description, remind_date}) {
        if (dateID !== null && dateID !== "") {
            updateReminder();
        } else {
            try {

                const updates = {
                    user: userid.id,
                    title,
                    description,
                    remind_date: recordDate,
                    created_at: new Date(),
                }

                let { error } = await supabase.from('dates').insert(updates, {
                    returning: 'minimal', // Don't return the value after inserting
                })

                if (error) {
                    throw error
                } else {
                    setIsFetch(true);
                }
            } catch (error) {
                alert(error.message)
            } finally {
                setIsFetch(false);
            }
        }

    }

    async function updateReminder() {
        try {

            const user = userid

            const updates = {
                id: dateID,
                user: user.id,
                title: title,
                description: description,
                remind_date: recordDate,
                created_at: new Date(),
            }

            let { error } = await supabase.from('dates').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                throw error
            } else {
                setIsFetch(true);
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setIsFetch(false);
        }
    }
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

    // async function getRecord() {
    //     try {

    //         let { data, error, status } = await supabase
    //             .from('dates')
    //             .select(`*`)
    //             .eq('id', dateID)
    //             .single()

    //         if (error && status !== 406) {
    //             throw error
    //         }

    //         if (data) {
    //             setTitle(data.title);
    //             setCDescription(data.description);
    //             setRecordDate(data.remind_date);
    //             setCreationDate(data.created_at);
    //         }
    //     } catch (error) {
    //         alert(error.message)
    //     } finally {

    //     }
    // }

    function changeLanguage(){
        let actual=localStorage.getItem('i18nextLng')
        localStorage.setItem('i18nextLng', actual==="es" ? "en":"es");
        window.location.reload(false);
    }

    return (
        <div className="form-widget">



            <h1>{i18next.t("title1")}</h1>


            <Avatar
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                    setAvatarUrl(url)
                    updateProfile({ username, consulting_room, avatar_url: url })
                }}
            />


            <div>
                <label htmlFor="email">{i18next.t("field1")}</label>
                <input id="email" type="text" value={session.user.email} disabled />
            </div>
            <div>
                <label htmlFor="username">{i18next.t("field2")}</label>
                <input
                    id="username"
                    type="text"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="consultingroom">{i18next.t("field3")}</label>
                <input
                    id="consultingroom"
                    type="consultingroom"
                    value={consulting_room || ''}
                    onChange={(e) => setConsultingroom(e.target.value)}
                />
            </div>

            <div>
                <button
                    className="button block primary"
                    onClick={() => updateProfile({ username, consulting_room, avatar_url })}
                    disabled={loading}>
                    {loading ? 'Loading ...' : i18next.t("button2")}
                </button>
            </div>

            <div>
                <button className="button block" onClick={() => supabase.auth.signOut()}>
                    {i18next.t("button3")}
                </button>
            </div>

            <h1>{i18next.t("field8")}</h1>
            <div>
                <label htmlFor="title">{i18next.t("field4")}</label>
                <input id="title" type="text" value={title || ''} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <label htmlFor="description">{i18next.t("field5")}</label>
                <input id="description" type="text" value={description || ''} onChange={(e) => setCDescription(e.target.value)} />
            </div>
            <div>
                <label htmlFor="reminddate">{i18next.t("field6")}</label>
                <input id="reminddate" type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} />
            </div>

            <div>
                <label htmlFor="creationDate">Fecha de creacion</label>
                <input id="creationDate" type="text" value={creationDate} onChange={(e) => setCreationDate(e.target.value)}/>
            </div>
            <div >
                <label htmlFor="idfield">id</label>
                <input id="idfield" type="text" onChange={(e) => setDateID(e.target.value)} />

                <button className="button primary block" onClick="//src/components/dates/Dates.jsx">{i18next.t("button4")}</button>
            </div>

            <button
                className="button block primary"
                onClick={() => insertRecord({ title, description, reminddate: recordDate })}
            >
                {dateID !== null && dateID !== "" ? i18next.t("button5v2") : i18next.t("button5")}
            </button>
           <button
                className="button block primary"
                onClick={() => deleteRecord()}
            >
                {i18next.t("button6")}
            </button>

            <h1>{i18next.t("field9")}</h1>
            {listRecords!== null ? listRecords.map((t) => <li key={t.id}> {i18next.t("record1")} {t.id} {i18next.t("record2")} {t.title} - {i18next.t("record3")} {t.content} - {i18next.t("record4")} {t.reminder} - {i18next.t("record5")} {t.created_at} -</li>):""}

            <div>
                <button className="button primary block"  onClick={() => changeLanguage()} >{i18next.t("lan")}</button>
            </div>
        </div>
    )
}