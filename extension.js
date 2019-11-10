const St = imports.gi.St;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const Layout = imports.ui.layout;

const ShellVersion = imports.misc.config.PACKAGE_VERSION.split('.').slice(0, 2).join('.');

function isVersionAbove(major, minor) {
    return ShellVersion > major + '.' + minor;
}

let button, actor, wrapRight;

function _onScroll(actor, event) {
    let motion;
    let dir = event.get_scroll_direction();
    switch(dir) {
        case Clutter.ScrollDirection.UP:
            motion = Meta.MotionDirection.UP;
            break;
        case Clutter.ScrollDirection.DOWN:
            motion = Meta.MotionDirection.DOWN;
            break;
        case Clutter.ScrollDirection.LEFT:
            motion = Meta.MotionDirection.LEFT;
            break;
        case Clutter.ScrollDirection.RIGHT:
            motion = Meta.MotionDirection.RIGHT;
            break;
        default:
            return Clutter.EVENT_PROPAGATE;
    }
    let wsManager = isVersionAbove(3, 28) ? global.workspace_manager : global.screen;
    let activeWs = wsManager.get_active_workspace();
    let ws = activeWs.get_neighbor(motion);
    if(!ws) return Clutter.EVENT_STOP;
    Main.wm.actionMoveWorkspace(ws);
    return Clutter.EVENT_STOP;
}

function init() {

}

function enable() {
    //add functioning button
    button = new St.Bin({ style_class: '',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true });
    let monitor = Main.layoutManager.primaryMonitor;
    button.set_size(1, monitor.height);
    button.set_position(monitor.width - 1, 0);
    Main.uiGroup.add_actor(button);
    button.connect("scroll-event", _onScroll);

    //add wrap of the button to make the button react to event even when other windows are on top of it
    actor = new St.Widget({
        clip_to_allocation: true,
        layout_manager: new Clutter.BinLayout()
    });

    // When the actor has a clip, it somehow breaks drag-and-drop funcionality in
    // the overview. We remove the actor's clip to avoid this.
    actor.set_clip(0, 0, 0, 0);

    actor.add_constraint(new Layout.MonitorConstraint({primary: true, work_area: true}));
    Main.layoutManager.addChrome(actor, {affectsInputRegion: false});
    wrapRight = new St.Widget({x_expand: true, y_expand: true,
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.END});
    wrapRight.set_size(1, monitor.height);

    //Deploy wrappers
    actor.add_actor(wrapRight);
    Main.layoutManager.trackChrome(wrapRight, {affectsInputRegion: true});
}

function disable() {
    Main.layoutManager.removeChrome(actor);
    Main.layoutManager.untrackChrome(wrapRight);
    button.destroy();
}
