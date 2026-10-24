import { api } from "../axios";


export async function addComment(postId : string){
    const{data} = await api.post(`/posts/${postId}/comment`);
    return data;
};

export async function deleteComment(commentId : string){
    const {data} = await api.delete(`/comment/${commentId}`);
    return data;
}


