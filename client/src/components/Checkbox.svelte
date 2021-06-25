<script>
    export let onCheck;
    export let checked = false;

    import { v4 as uuidv4 } from "uuid";

    let id = uuidv4();
</script>

<label class="checkbox">
    <input type="checkbox" {checked} on:change={onCheck} />
    <svg viewBox="0 0 21 18">
        <symbol
            id="tick-path-{id}"
            viewBox="0 0 21 18"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5.22003 7.26C5.72003 7.76 7.57 9.7 8.67 11.45C12.2 6.05 15.65 3.5 19.19 1.69"
                fill="none"
                stroke-width="2.25"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </symbol>
        <defs>
            <mask id="tick_{id}">
                <use class="tick mask" href="#tick-path-{id}" />
            </mask>
        </defs>
        <use class="tick" href="#tick-path-{id}" stroke="currentColor" />
        <path
            fill="white"
            mask="url(#tick_{id})"
            d="M18 9C18 10.4464 17.9036 11.8929 17.7589 13.1464C17.5179 15.6054 15.6054 17.5179 13.1625 17.7589C11.8929 17.9036 10.4464 18 9 18C7.55357 18 6.10714 17.9036 4.85357 17.7589C2.39464 17.5179 0.498214 15.6054 0.241071 13.1464C0.0964286 11.8929 0 10.4464 0 9C0 7.55357 0.0964286 6.10714 0.241071 4.8375C0.498214 2.39464 2.39464 0.482143 4.85357 0.241071C6.10714 0.0964286 7.55357 0 9 0C10.4464 0 11.8929 0.0964286 13.1625 0.241071C15.6054 0.482143 17.5179 2.39464 17.7589 4.8375C17.9036 6.10714 18 7.55357 18 9Z"
        />
    </svg>
</label>

<style>
    .checkbox {
        --border-default: #bbbbc1;
        --border-hover: #9898a3;
        --active: #34d399;
        --active-tick: #ffffff;
        display: block;
        width: 18px;
        height: 18px;
        cursor: pointer;
        position: relative;
        -webkit-tap-highlight-color: transparent;
    }
    .checkbox svg {
        display: block;
        position: absolute;
    }
    .checkbox input {
        display: block;
        outline: none;
        border: none;
        padding: 0;
        margin: 0;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 36%/36%;
        box-shadow: inset 0 0 0 1.5px var(--border, var(--border-default));
        background: var(--background, transparent);
        transition: background 0.25s linear, box-shadow 0.25s linear;
    }
    .checkbox input + svg {
        width: 21px;
        height: 18px;
        left: 0;
        top: 0;
        color: var(--active-tick);
    }
    .checkbox input + svg .tick {
        stroke-dasharray: 20;
        stroke-dashoffset: var(--stroke-dashoffset, 20);
        transition: stroke-dashoffset 0.2s;
    }
    .checkbox input + svg .tick.mask {
        stroke: var(--active-tick);
    }
    .checkbox input:checked {
        --background: var(--active);
        --border: var(--active);
    }
    .checkbox input:checked + svg {
        --stroke-dashoffset: 0;
    }
    .checkbox:hover input:not(:checked) {
        --border: var(--border-hover);
    }
</style>
