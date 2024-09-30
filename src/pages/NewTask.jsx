import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import "./newTask.scss"
import { useNavigate } from "react-router-dom";
// dayjs
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc); // プラグインを拡張

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("");
  const [detail, setDetail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);

  // 入力された期限をYYYY-MM-DDTHH:MM:SSZ形式へ
  const handleLimitChange = (e) => {
    const inputdate = e.target.value; // YYYY-MM-DDTHH:MM形式
    // UTCとして設定 + UTC→JST + YYYY-MM-DDTHH:MM:SSZ形式へformat
    const formattedLimit = dayjs(inputdate).utcOffset(9).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    setLimit(formattedLimit);
  };

  // 期限を表示できるようにするために整形する関数
  const formatLimitForInput = (limit) => {

    const utcLimit = dayjs(limit).utc(); // UTCとして設定
    const jstLimit = utcLimit.utcOffset(9); // JSTに変換
    const formattedLimit = jstLimit.format('YYYY-MM-DDTHH:mm'); // YYYY-MM-DDTHH:mm 形式へ
    return formattedLimit;
  };
  
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);
  const onCreateTask = () => {
    const data = {
      title: title,
      // リクエストに期限を追加
      limit: limit,
      detail: detail,
      done: false,
    };

    axios.post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`
        }
    })
    .then(() => {
      navigate("/");
    })
    .catch((err) => {
      setErrorMessage(`タスクの作成に失敗しました。${err}`);
    })
  }

  useEffect(() => {
    axios.get(`${url}/lists`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setLists(res.data)
      setSelectListId(res.data[0]?.id)
    })
    .catch((err) => {
      setErrorMessage(`リストの取得に失敗しました。${err}`);
    })
  }, [])

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label><br />
          <select onChange={(e) => handleSelectList(e.target.value)} className="new-task-select-list">
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>{list.title}</option>
            ))}
          </select><br />
          <label>タイトル</label><br />
          <input type="text" onChange={handleTitleChange} className="new-task-title" /><br />
          <label>期限</label><br />
          <input type="datetime-local" onChange={handleLimitChange} className="edit-task-title" value={formatLimitForInput(limit)} /><br />
          <label>詳細</label><br />
          <textarea type="text" onChange={handleDetailChange} className="new-task-detail" /><br />
          <button type="button" className="new-task-button" onClick={onCreateTask}>作成</button>
        </form>
      </main>
    </div>
  )
}