import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";
// dayjs
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc); // utcプラグインを拡張


export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios.get(`${url}/lists`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setLists(res.data)
    })
    .catch((err) => {
      setErrorMessage(`リストの取得に失敗しました。${err}`);
    })
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id
    if(typeof listId !== "undefined"){
      setSelectListId(listId)
      axios.get(`${url}/lists/${listId}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`
        }
      })
      .then((res) => {
        setTasks(res.data.tasks)
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      })
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios.get(`${url}/lists/${id}/tasks`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setTasks(res.data.tasks)
    })
    .catch((err) => {
      setErrorMessage(`タスクの取得に失敗しました。${err}`);
    })
  }
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p><Link to="/list/new">リスト新規作成</Link></p>
              <p><Link to={`/lists/${selectListId}/edit`}>選択中のリストを編集</Link></p>
            </div>
          </div>
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li 
                  key={key}
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectList(list.id)}
                >
                  {list.title}
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select onChange={handleIsDoneDisplayChange} className="display-select">
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks tasks={tasks} selectListId={selectListId} isDoneDisplay={isDoneDisplay} />
          </div>
        </div>
      </main>
    </div>
  )
}

// limitをYYYY/MM/DD HH:MM形式 へ
const formattedLimit = (limit) => {
  if (!limit) return '';

  return dayjs(limit).format('YYYY/MM/DD HH:mm');
};

// 残り時間を計算する関数
const remainingTime = (limit) => {
  const limitDate = dayjs(limit); // limitをdayjsとして設定
  const now = dayjs(); // 現在日時（日本）
  const difftime = limitDate.diff(now); // 残り時間をミリ秒で取得

  // 期限過ぎたとき
  if (difftime <= 0) {
    return "期限が過ぎています";
  }
  // 期限が設定されていないとき
  if (limit === null) {
    return " - ";
  }

  // 残り時間を日・時間・分に変換
  const days = limitDate.diff(now, 'day');
  const hours = limitDate.diff(now, 'hour') % 24;
  const minutes = limitDate.diff(now, 'minute') % 60;

  return `${days}日 ${hours}時間 ${minutes}分`;
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>

  if(isDoneDisplay == "done"){
    return (
      <ul>
        {tasks.filter((task) => {
          return task.done === true
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
              {task.title}<br />
              期限：{formattedLimit(task.limit) ? formattedLimit(task.limit) : '期限が設定されていません'}<br />
              残り時間：{remainingTime(task.limit)}<br/>
              {task.done ? "進捗：完了" : "進捗：未完了"}
            </Link>
            <br /><br />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul>
      {tasks.filter((task) => {
        return task.done === false
      })
      .map((task, key) => (
        <li key={key} className="task-item">
          <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
            タイトル：{task.title}<br />
            期限：{formattedLimit(task.limit) ? formattedLimit(task.limit) : '期限が設定されていません'}<br />
            残り時間：{remainingTime(task.limit)}<br/>
            {task.done ? "進捗：完了" : "進捗：未完了"}
          </Link>
          <br /><br />
        </li>
      ))}
    </ul>
  )
}