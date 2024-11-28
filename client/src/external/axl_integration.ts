import AxL from './axl';

export const axlHandshake = () => {
    const axl = new AxL();
    const handshake = axl.handshake();
    return {axl, handshake};
}