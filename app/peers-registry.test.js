const PeersRegistry = require("./PeersRegistry");

describe('PeersRegsitry', () => {

    let PEERS_REGISTRY;

    beforeEach(() => {
        PEERS_REGISTRY = new PeersRegistry()
    })

    it('should return correct peers number when one added', () => {
        PEERS_REGISTRY.addPeer('peer1')
        expect(PEERS_REGISTRY.getPeers().length).toEqual(1)
    })

    it('should return correct peers number when multiple added', () => {
        PEERS_REGISTRY.addPeersAsList(['peer1', 'peer2', 'peer3'])
        expect(PEERS_REGISTRY.getPeers().length).toEqual(3)
    })

    it('should return correct peers and peers number when peer removed', () => {
        PEERS_REGISTRY.addPeersAsList(['peer1', 'peer2', 'peer3'])
        expect(PEERS_REGISTRY.removePeer('peer2').length).toEqual(2)
        expect(PEERS_REGISTRY.getPeers()).toContainEqual('peer1')
        expect(PEERS_REGISTRY.getPeers()).toContainEqual('peer3')

        expect(PEERS_REGISTRY.getPeers()).not.toContainEqual('peer2')
    })

    it('should not add peer if peer exists', () => {
        PEERS_REGISTRY.addPeersAsList(['peer1', 'peer2', 'peer3'])
        expect(PEERS_REGISTRY.getPeers().length).toEqual(3)
        
        PEERS_REGISTRY.addPeer('peer1')
        expect(PEERS_REGISTRY.getPeers().length).toEqual(3)

        expect(PEERS_REGISTRY.getPeers()).toContainEqual('peer1')
        expect(PEERS_REGISTRY.getPeers()).toContainEqual('peer2')
        expect(PEERS_REGISTRY.getPeers()).toContainEqual('peer3')
    })

    it('should find existing peer', () => {
        PEERS_REGISTRY.addPeersAsList(['peer1', 'peer2', 'peer3'])
        expect(PEERS_REGISTRY.findPeer('peer2')).toEqual('peer2')
    })

    it(`should retrun undefined if peer don't exists`, () => {
        PEERS_REGISTRY.addPeersAsList(['peer1', 'peer2', 'peer3'])
        expect(PEERS_REGISTRY.findPeer('peer5')).toEqual(undefined)
    })

})