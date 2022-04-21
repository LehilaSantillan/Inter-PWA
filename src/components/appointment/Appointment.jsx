export default function Account({ session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState(null)
    const [consulting_room, setConsulting_room] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)
    const [content, setContent] = useState(null);
    const [title, setTitle] = useState(null);
    const [recordDate, setRecordDate] = useState(new Date());
    const [creationDate,setCreationDate]=useState(null);
    const [isFetch, setIsFetch] = useState(false);
    const [recordID, setRecordID] = useState(null);
    const [userid] = useState(supabase.auth.user());
    const [listappointment,setListAppointment]=useState(null);
    useEffect(() => {
        if (avatar_url) downloadImage(avatar_url)
        getProfile()
        listappointment()
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
                setConsulting_room(data.consulting_room)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function deleteAppointment() {
        try {
            const { error } = await supabase
                .from('citas')
                .delete()
                .eq('id', appointmentID)
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

    async function insertAppointment({ title, content, reminder }) {
        if (appointmentID !== null && appointmentID !== "") {
            updateApointment();
        } else {
            try {

                const updates = {
                    user: userid.id,
                    title,
                    content,
                    reminder_date: recordDate,
                    created_at: new Date(),
                }

                let { error } = await supabase.from('citas').insert(updates, {
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

    async function updateAppointment() {
        try {

            const user = userid

            const updates = {
                id: appointmentID,
                user: user.id,
                title: title,
                content: content,
                reminder_date: recordDate,
                created_at: new Date(),
            }

            let { error } = await supabase.from('citas').upsert(updates, {
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
    async function listappointment() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('citas')
                .select(`*`)
                .eq('user', user.id)


            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setListAppointment(data);

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
                .from('citas')
                .select(`*`)
                .eq('id', appointmentID)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setTitle(data.title);
                setContent(data.content);
                setRecordDate(data.reminder_date);
                setCreationDate(data.created_at);
            }
        } catch (error) {
            alert(error.message)
        } finally {

        }
    }

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
                <label htmlFor="consulting_room">{i18next.t("field3")}</label>
                <input
                    id="consulting_room"
                    type="text"
                    value={consulting_room || ''}
                    onChange={(e) => setConsulting_room(e.target.value)}
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
                <label htmlFor="content">{i18next.t("field5")}</label>
                <input id="content" type="text" value={content || ''} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div>
                <label htmlFor="reminderdate">{i18next.t("field6")}</label>
                <input id="reminderdate" type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} />
            </div>

            <div>
                <label htmlFor="creationDate">Fecha de creacion</label>
                <input id="creationDate" type="text" value={creationDate} onChange={(e) => setCreationDate(e.target.value)} disabled={true}/>
            </div>
            <div >
                <label htmlFor="idfield">id</label>
                <input id="idfield" type="text" onChange={(e) => setAppointmentID(e.target.value)} />

                <button className="button primary block" onClick={() => getRecord()}>{i18next.t("button4")}</button>
            </div>

            <button
                className="button block primary"
                onClick={() => insertAppointment({ title, content, reminderdate: recordDate })}
            >
                {appointmentID !== null && appointmentID !== "" ? i18next.t("button5v2") : i18next.t("button5")}
            </button>
           <button
                className="button block primary"
                onClick={() => deleteAppointment()}
            >
                {i18next.t("button6")}
            </button>

            <h1>{i18next.t("field9")}</h1>
            {listappointment!== null ? listappointment.map((t) => <li key={t.id}> {i18next.t("record1")} {t.id} {i18next.t("record2")} {t.title} - {i18next.t("record3")} {t.content} - {i18next.t("record4")} {t.reminder} - {i18next.t("record5")} {t.created_at} -</li>):""}

            <div>
                <button className="button primary block"  onClick={() => changeLanguage()} >{i18next.t("lan")}</button>
            </div>
        </div>
    )
}