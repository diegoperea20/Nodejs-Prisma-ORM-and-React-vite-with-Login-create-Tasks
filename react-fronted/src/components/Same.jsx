import React, { useEffect, useState } from 'react';
import "../same.css";
// Conection to backend flask
const API_URL = import.meta.env.VITE_REACT_APP_API;

function Same() {
  const task = () => {
    window.location.href = '/home/task';
  };

  const [user, setUser] = useState('');
  const [sameCount, setSameCount] = useState([]);
  const [emailsc, setEmailsc] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      // Si no se encuentra el nombre de usuario en el almacenamiento local, redirigir al inicio de sesión
      window.location.replace('/');
    }
    setUser(storedUser);
  }, []);

  const getSameCount = async (user) => {
    const response = await fetch(`${API_URL}/tasksi/countsames/${user}`);
    const data = await response.json();
    console.log(data);
    setSameCount(data);
    if (data && data.message === "Ningún título coincide con otros usuarios.") {
      window.alert("Ningún título coincide con otros usuarios.");
    }
  };
  

  const getemails = async (user) => {
    const response = await fetch(`${API_URL}/taskse/countsame/${user}`);
    const data = await response.json();
    console.log(data);
    setEmailsc(data);
    if (data && data.message === "Ningún título coincide con otros usuarios.") {
      window.alert("Ningún título coincide con otros usuarios.");
    }
  };

  return (
    <div className="darkTheme">
      <h1>Same</h1>
      <button className="taskButton" onClick={task}>Task</button>
      <button className="countButton" onClick={() => getSameCount(user)}> Count People Same title</button>
      <button  onClick={() => getemails(user)}>People Emails same title </button>
      <div>
      {sameCount.length > 0 && (
        <table className="sameCountTable">
          <thead>
            <tr>
              <th className='count'>Number of titles</th>
              <th className='count'>Title</th>
            </tr>
          </thead>
          <tbody>
            {sameCount.map((item, index) => (
              <tr key={index}>
                <td className='justified'>{item['Number of titles']}</td>
                <td className='justified'>{item.title}</td>
              </tr>
            ))}
            
           {/*  SI HAY UN id o identificador dentro de la solicitud {sameCount.map((item) => (
            <tr key={item.id}>
              <td>{item['Number of titles']}</td>
              <td>{item.title}</td>
              <td></td>
            </tr>
          ))} */}

          </tbody>
        </table>
      )}
      <div>
      {emailsc.length > 0 && (
        <table className="emailscTable">
          <thead>
            <tr>
              <th>Emails</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {emailsc.map((item, index) => (
              <>
                <tr key={index}>
                  <td>{item.emails[0]}</td>
                  <td>{item.title}</td>
                </tr>
                {item.emails.slice(1).map((email, i) => (
                  <tr key={`${index}-${i}`}>
                    <td className='justified'>{email}</td>
                    <td className='justified'></td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      )}

      </div>
      </div>
    </div>
  );
}

export default Same;


