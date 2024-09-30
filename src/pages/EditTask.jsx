import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useNavigate, useParams } from "react-router-dom";
import "./editTask.scss"
// dayjs
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc); // プラグインを拡張

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const handleTitleChange = (e) => setTitle(e.target.value);

  // 入力された期限をSET
  const handleLimitChange = (e) => {setLimit(e.target.value)};

  // API送信用にlimitをYYYY-MM-DDTHH:MM:SSZ形式へ
  const formatLimitForAPI = (limit) => {
    const utcLimit = dayjs(limit).utc(); // UTCとして設定
    const formattedLimit = utcLimit.format('YYYY-MM-DDTHH:mm:ss[Z]'); // YYYY-MM-DDTHH:MM:SSZ形式へ、-9時間される
    return formattedLimit;
  };
  
  // 期限を初期表示できるようにするためにYYYY-MM-DDTHH:mm 形式へ
  const formatLimitForInput = (limit) => {
    const utcLimit = dayjs(limit).utc(); // UTCとして設定
    const jstLimit = utcLimit.utcOffset(9); // JSTに変換
    const formattedLimit = jstLimit.format('YYYY-MM-DDTHH:mm'); // YYYY-MM-DDTHH:mm 形式へ
    return formattedLimit;
  };

  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");
  const onUpdateTask = () => {
    console.log(isDone)
    const data = {
      title: title,
      // リクエストに期限を追加
      limit: formatLimitForAPI(limit),
      detail: detail,
      done: isDone
    }

    axios.put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      console.log(res.data)
      navigate("/");
    })
    .catch((err) => {
      setErrorMessage(`更新に失敗しました。${err}`);
    })
  }

  const onDeleteTask = () => {
    axios.delete(`${url}/lists/${listId}/tasks/${taskId}`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then(() => {
      navigate("/");
    })
    .catch((err) => {
      setErrorMessage(`削除に失敗しました。${err}`);
    })
  }

  useEffect(() => {
    axios.get(`${url}/lists/${listId}/tasks/${taskId}`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      const task = res.data
      setTitle(task.title)
      // 期限(初期値)を表示させるためにset
      setLimit(formatLimitForInput(task.limit))
      setDetail(task.detail)
      setIsDone(task.done)
    })
    .catch((err) => {
      setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
    })
  }, [])

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label><br />
          <input type="text" onChange={handleTitleChange} className="edit-task-title" value={title} /><br />
          <label>期限</label><br />
          <input type="datetime-local" onChange={handleLimitChange} className="edit-task-title" value={limit} /><br />
          <label>詳細</label><br />
          <textarea type="text" onChange={handleDetailChange} className="edit-task-detail" value={detail} /><br />
          <div>
            <input type="radio" id="todo" name="status" value="todo" onChange={handleIsDoneChange} checked={isDone === false ? "checked" : ""} />未完了
            <input type="radio" id="done" name="status" value="done" onChange={handleIsDoneChange} checked={isDone === true ? "checked" : ""} />完了
          </div>
          <button type="button" className="delete-task-button" onClick={onDeleteTask}>削除</button>
          <button type="button" className="edit-task-button" onClick={onUpdateTask}>更新</button>
          <button type="button" className="back-button" onClick={() => window.location.href = "/"}>戻る</button>
        </form>
      </main>
    </div>
  )
}