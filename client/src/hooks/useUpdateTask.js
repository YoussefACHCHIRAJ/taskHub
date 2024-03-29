import axios from "axios";
import { useMutation } from "react-query";
import useAuthContext from "./useAuthContext";

const useUpdateTask = ({ onSuccess }) => {
    const { auth } = useAuthContext()

    const query = useMutation(async ({taskId, updatedTask }) => {
        try {
            await axios.put(`http://localhost:3001/tasks/update/${taskId}`, updatedTask, {
                headers: {
                    "Authorization": `bearer ${auth.token}`
                }
            });
            onSuccess();
            return true;
        } catch (error) {
            throw error.response.data;
        }
    }
    );
    return query;
}


export default useUpdateTask;