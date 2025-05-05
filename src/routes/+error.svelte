
<script>
	import { page } from '$app/state';

    const status = page.status;

    const getDayOfWeek = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    };
</script>

<h1>{page.status}</h1>
{#if status >= 400 && status < 500}
    <p>Yeah, this page isn't a thing.</p>
    <p>If you feel gaslighted, because it <i>should</i> be a thing, please rest assured that I am 99% likely to be the one among the two of us who has royally fucked up.</p>
    <p>Coding is hard.</p>
    <p>Anyway, have a nice {getDayOfWeek()}.</p>
{:else if status >= 500 && status < 600}
    <p>Ooh, this is a fun error. It just means that I don't know how to connect the different pieces of my code together properly.</p>
    <p>But the fun part is it's not your fault.</p>
    <p>Unless you're a hacker.</p>
    <p>In which case, shoo.</p>
{:else}
    <p>This wasn't the plan.</p>
    <p>We're now improvising here.</p>
    <p>Here, close your eyes and pretend nothing happened.</p>
    <p>...</p>
    <p>You opened them again, didn't you.</p>
{/if}