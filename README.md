# @winglab/inertia-table

A table component for Laravel & Inertia.

## Install

### Laravel Project

Configure a Laravel & Inertia & React project according to the documentation: [Laravel: Frontend - Inertia](https://laravel.com/docs/13.x/frontend#inertia)

### Install Component
```bash
# Component
npm install -D @winglab/inertia-table

# Dependencies(if not installed)
npm install -D @inertiajs/react@3 react@19 react-dom@19
```

## Use In Pages/Components

#### use laravel pagination

```php
// UserController

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $size = $request->input('size', 10);
        
        return inertia('user/index', [
            'data' => User::paginate($size)->withQueryString()
        ]);
    }
}
```

```tsx
// user/index.tsx
import { ColumnsDef, RouterTable, type PaginateData } from '@winglab/inertia-table';

export default function Users({ data }: { data: PaginateData<UserType> }) {
    const columns = ColumnsDef<UserType>([
        {
            dataKey: 'name',
            title: 'User',
            sortable: true,
        },
        {
            dataKey: 'phone',
            title: 'Phone',
            sortable: true,
        },
        {
            dataKey: 'email',
            title: 'Email',
            sortable: true,
        },
        {
            dataKey: 'role',
            title: 'Role',
            tableRowRender: (data) => (
                <>
                    {data.role === 'user' && 'User'}
                    {data.role === 'admin' && 'Admin'}
                </>
            ),
            filter: [
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
            ],
        },
        {
            index: 'actions',
            tableRowRender: (data) => {
                return (
                    <Button asChild variant="secondary">
                        <Link href={route('users.show', data.id)}>View</Link>
                    </Button>
                );
            },
        },
    ]);

    return (
        <Layout>
            <RouterTable columns={columns} data={data} />
        </Layout>
    );
}

```


#### use frontend pagination

```php
// UserController

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {        
        return inertia('user/index', [
            'data' => User::all()
        ]);
    }
}
```

```tsx
// user/index.tsx
import {ColumnsDef, Table} from '@winglab/inertia-table';

export default function Users({data}: { data: UserType[] }) {
    const columns = ColumnsDef<UserType>([
        {
            dataKey: 'name',
            title: 'User',
            sortable: true,
        },
        {
            dataKey: 'phone',
            title: 'Phone',
            sortable: true,
        },
        {
            dataKey: 'email',
            title: 'Email',
            sortable: true,
        },
        {
            dataKey: 'role',
            title: 'Role',
            tableRowRender: (data) => (
                <>
                    {data.role === 'user' && 'User'}
                    {data.role === 'admin' && 'Admin'}
                </>
            ),
            filter: [
                {label: 'User', value: 'user'},
                {label: 'Admin', value: 'admin'},
            ],
        },
        {
            index: 'actions',
            tableRowRender: (data) => {
                return (
                    <Button asChild variant="secondary">
                        <Link href={route('users.show', data.id)}>View</Link>
                    </Button>
                );
            },
        },
    ]);

    return (
        <Layout>
            <Table columns={columns} data={data}/>
        </Layout>
    );
}
```