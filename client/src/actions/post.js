import axios from "axios";
import { setAlert } from "./alert";
import {
  GET_POSTS,
  GET_POST,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  ADD_COMMENT,
  REMOVE_COMMENT
} from "./types";

/// Get posts
export const getPosts = () => async dispatch => {
  try {
    const res = await axios.get("/posts");
    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

/// Get post
export const getPost = id => async dispatch => {
  try {
    const res = await axios.get(`/posts/${id}`);
    dispatch({
      type: GET_POST,
      payload: res.data
    });
  } catch (err) {
    // dispatch({
    //   type: POST_ERROR,
    //   payload: { msg: err.response.statusText, status: err.response.status }
    // });
    console.log(err);
  }
};

//Add Like
export const addLike = postId => async dispatch => {
  try {
    const res = await axios.put(`/posts/like/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { postId, likes: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Remove Like
export const removeLike = postId => async dispatch => {
  try {
    const res = await axios.put(`/posts/unlike/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { postId, likes: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Remove post
export const deletePost = postId => async dispatch => {
  try {
    await axios.delete(`/posts/${postId}`);
    dispatch({
      type: DELETE_POST,
      payload: postId
    });

    dispatch(setAlert("post removed", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Add post
export const addPost = formData => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  try {
    const res = await axios.post("/posts", formData, config);
    dispatch({
      type: ADD_POST,
      payload: res.data
    });

    dispatch(setAlert("post created", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Add Comment
export const addComment = (postId, formData) => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  try {
    const res = await axios.post(`/posts/comment/${postId}`, formData, config);
    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });

    dispatch(setAlert("Comment Added", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Delete Comment
export const removeComment = (postId, commentId) => async dispatch => {
  try {
    const res = await axios.delete(`/posts/comment/${postId}/${commentId}`);
    dispatch({
      type: REMOVE_COMMENT,
      payload: res.data
    });

    dispatch(setAlert("Comment Removed", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
