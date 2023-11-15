import Cookies from "js-cookie";

const Disconnect: React.FC = () => {

    const disconnect = () => {
        Cookies.remove('jwt-token');
        // setIsConnected(false)
        window.location.reload();
      }

    return (
        <button className='button-29' onClick={disconnect}>Disconnection</button>
    )
}

export default Disconnect;