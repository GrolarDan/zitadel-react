import {useEffect, useState} from "react";
import {User, UserManager} from "oidc-client-ts";

type Props = {
    authenticated: boolean | null;
    setAuth: (authenticated: boolean | null) => void;
    userManager: UserManager;
    handleLogout: any;
};

const Callback = ({
                      authenticated,
                      setAuth,
                      userManager,
                      handleLogout,
                  }: Props) => {
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [tasks, setTasks] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const getTasks = () => {
        setLoading(true);
        fetch('/api/tasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userInfo?.access_token}`,
            },
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch tasks');
            }
        })
        .then(data => {
            setTasks(data);
            setError('');
            setLoading(false);
        })
        .catch((error) => {
            console.error(error);
            setError('Error: Unable to fetch tasks' + error);
            setLoading(false);
        })
    }

    useEffect(() => {
        if (authenticated === null) {
            userManager
            .signinRedirectCallback()
            .then((user: User) => {
                if (user) {
                    setAuth(true);
                    setUserInfo(user);
                } else {
                    setAuth(false);
                }
            })
            .catch((error: any) => {
                setAuth(false);
            });
        }
        if (authenticated === true && userInfo === null) {
            userManager
            .getUser()
            .then((user) => {
                if (user) {
                    setAuth(true);
                    setUserInfo(user);
                } else {
                    setAuth(false);
                }
            })
            .catch((error: any) => {
                setAuth(false);
            });
        }
        if (authenticated === true) {
            getTasks();
        }
    }, [authenticated, userManager, setAuth, setUserInfo, userInfo]);

    if (authenticated === true && userInfo) {
        return (
            <div className="user">
                <h2>Welcome, {userInfo.profile.name}!</h2>
                <p className="description">Your ZITADEL Profile Information</p>
                <p>Name: {userInfo.profile.name}</p>
                <p>Email: {userInfo.profile.email}</p>
                <p>Email Verified: {userInfo.profile.email_verified ? "Yes" : "No"}</p>
                <p>
                    Roles:{" "}
                    {JSON.stringify(
                        userInfo.profile[
                            "urn:zitadel:iam:org:project:roles"
                            ]
                    )}
                </p>
                <p>
                    Organization:{" "}
                    {JSON.stringify(userInfo.profile["urn:zitadel:iam:user:resourceowner:name"])}
                </p>

                {loading && <p>Loading tasks...</p>}
                {error && <p>{error}</p>}
                <p>==========================================================</p>
                {tasks.length > 0 && (
                    <div>
                        <p>Tasks:</p>
                        <ul>
                            {tasks.map((task, index) => (
                                <li key={index}>{task}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {tasks.length === 0 && !loading && <p>No tasks found</p>}
                <p>==========================================================</p>
                <button onClick={handleLogout}>Log out</button>
            </div>
        );
    } else {
        return <div>Loading...</div>;
    }
};

export default Callback;
